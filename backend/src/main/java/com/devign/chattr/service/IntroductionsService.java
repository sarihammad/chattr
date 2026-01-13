package com.devign.chattr.service;

import com.devign.chattr.dto.IntroductionDTO;
import com.devign.chattr.dto.UserProfileDTO;
import com.devign.chattr.exception.NotFoundException;
import com.devign.chattr.exception.BlockedUserException;
import com.devign.chattr.model.*;
import com.devign.chattr.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class IntroductionsService {

    private static final int MAX_DAILY_INTRODUCTIONS = 3;
    private static final double MIN_SCORE_THRESHOLD = 0.5; // Minimum compatibility score
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MatchCandidateRepository matchCandidateRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private BlockRepository blockRepository;

    @Autowired
    private QuestionnaireAnswerRepository answerRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private CompatibilityScoringService scoringService;

    @Autowired
    private BlockService blockService;

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Get today's introductions for a user (1-3 candidates).
     * If not generated yet, generate them on-demand.
     */
    @Transactional
    public List<IntroductionDTO> getIntroductions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));

        LocalDate today = LocalDate.now();

        // Check if introductions already exist for today
        List<MatchCandidate> existingCandidates = matchCandidateRepository
                .findByUserAndMatchDateOrderByScoreDesc(user, today);

        if (existingCandidates.isEmpty()) {
            // Generate introductions for today
            generateIntroductions(user, today);
            existingCandidates = matchCandidateRepository
                    .findByUserAndMatchDateOrderByScoreDesc(user, today);
        }

        // Return pending/shown candidates (not passed)
        return existingCandidates.stream()
                .filter(c -> c.getStatus() == MatchCandidate.CandidateStatus.PENDING ||
                            c.getStatus() == MatchCandidate.CandidateStatus.SHOWN)
                .limit(MAX_DAILY_INTRODUCTIONS)
                .map(this::toIntroductionDTO)
                .collect(Collectors.toList());
    }

    /**
     * Generate 1-3 introductions for a user for a given date.
     */
    @Transactional
    public void generateIntroductions(User user, LocalDate date) {
        // Find all potential candidates
        List<User> candidates = findPotentialCandidates(user);

        if (candidates.isEmpty()) {
            log.info("No candidates found for user: {}", user.getUsername());
            return;
        }

        // Compute compatibility scores
        List<CandidateScore> scoredCandidates = candidates.stream()
                .map(candidate -> {
                    double score = scoringService.computeCompatibilityScore(user, candidate);
                    Map<String, Object> reasons = scoringService.computeMatchReasons(user, candidate);
                    return new CandidateScore(candidate, score, reasons);
                })
                .filter(cs -> cs.score >= MIN_SCORE_THRESHOLD)
                .sorted((a, b) -> Double.compare(b.score, a.score))
                .collect(Collectors.toList());

        if (scoredCandidates.isEmpty()) {
            log.info("No candidates above threshold for user: {}", user.getUsername());
            return;
        }

        // Take top MAX_DAILY_INTRODUCTIONS candidates
        int count = Math.min(MAX_DAILY_INTRODUCTIONS, scoredCandidates.size());

        for (int i = 0; i < count; i++) {
            CandidateScore cs = scoredCandidates.get(i);
            User candidate = cs.candidate;

            // Check if already generated today
            Optional<MatchCandidate> existing = matchCandidateRepository
                    .findByUserAndCandidateUserAndMatchDate(user, candidate, date);

            if (existing.isPresent()) {
                continue; // Skip if already exists
            }

            // Build reasons JSON
            String reasonsJson;
            try {
                reasonsJson = objectMapper.writeValueAsString(cs.reasons);
            } catch (Exception e) {
                log.error("Error serializing reasons", e);
                reasonsJson = "{}";
            }

            MatchCandidate matchCandidate = MatchCandidate.builder()
                    .user(user)
                    .candidateUser(candidate)
                    .score(cs.score)
                    .reasonsJson(reasonsJson)
                    .matchDate(date)
                    .status(MatchCandidate.CandidateStatus.PENDING)
                    .build();

            matchCandidateRepository.save(matchCandidate);
        }

        log.info("Generated {} introductions for user: {} on date: {}", count, user.getUsername(), date);
    }

    /**
     * Accept an introduction - if both users accept, create a match.
     */
    @Transactional
    public void acceptIntroduction(String username, Long candidateId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));

        MatchCandidate candidate = matchCandidateRepository.findById(candidateId)
                .orElseThrow(() -> new NotFoundException("Introduction not found: " + candidateId));

        if (!candidate.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Introduction does not belong to user");
        }

        candidate.setStatus(MatchCandidate.CandidateStatus.ACCEPTED);
        if (candidate.getSurfacedAt() == null) {
            candidate.setSurfacedAt(LocalDateTime.now());
        }
        matchCandidateRepository.save(candidate);

        // Check if the other user also accepted
        Optional<MatchCandidate> reverseCandidate = matchCandidateRepository
                .findByUserAndCandidateUserAndMatchDate(
                        candidate.getCandidateUser(),
                        user,
                        candidate.getMatchDate()
                );

        if (reverseCandidate.isPresent() && 
            reverseCandidate.get().getStatus() == MatchCandidate.CandidateStatus.ACCEPTED) {
            // Both accepted - create match
            createMatch(user, candidate.getCandidateUser());
        }
    }

    /**
     * Pass (reject) an introduction.
     */
    @Transactional
    public void passIntroduction(String username, Long candidateId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));

        MatchCandidate candidate = matchCandidateRepository.findById(candidateId)
                .orElseThrow(() -> new NotFoundException("Introduction not found: " + candidateId));

        if (!candidate.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Introduction does not belong to user");
        }

        candidate.setStatus(MatchCandidate.CandidateStatus.PASSED);
        if (candidate.getSurfacedAt() == null) {
            candidate.setSurfacedAt(LocalDateTime.now());
        }
        matchCandidateRepository.save(candidate);
    }

    /**
     * Mark an introduction as shown (when user views it).
     */
    @Transactional
    public void markIntroductionAsShown(String username, Long candidateId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));

        MatchCandidate candidate = matchCandidateRepository.findById(candidateId)
                .orElseThrow(() -> new NotFoundException("Introduction not found: " + candidateId));

        if (!candidate.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Introduction does not belong to user");
        }

        if (candidate.getStatus() == MatchCandidate.CandidateStatus.PENDING) {
            candidate.setStatus(MatchCandidate.CandidateStatus.SHOWN);
            candidate.setSurfacedAt(LocalDateTime.now());
            matchCandidateRepository.save(candidate);
        }
    }

    private List<User> findPotentialCandidates(User user) {
        // Hard filters first
        List<User> allUsers = userRepository.findAll();

        return allUsers.stream()
                .filter(candidate -> !candidate.getId().equals(user.getId())) // Not self
                .filter(candidate -> !blockService.isBlocked(user.getUsername(), candidate.getUsername())) // Not blocked
                .filter(candidate -> !blockService.isBlocked(candidate.getUsername(), user.getUsername())) // Not blocked reverse
                .filter(candidate -> !hasActiveMatch(user, candidate)) // Not already matched
                .filter(candidate -> !recentlyPassed(user, candidate)) // Not recently passed (7 day cooldown)
                .filter(candidate -> passesPreferenceFilters(user, candidate)) // Preference filters
                .filter(candidate -> hasCompletedQuestionnaire(candidate)) // Has completed questionnaire
                .collect(Collectors.toList());
    }

    private boolean hasActiveMatch(User user1, User user2) {
        Optional<Match> match = matchRepository.findByUserAAndUserB(user1, user2);
        if (match.isPresent() && match.get().getIsActive()) {
            return true;
        }
        match = matchRepository.findByUserBAndUserA(user1, user2);
        return match.isPresent() && match.get().getIsActive();
    }

    private boolean recentlyPassed(User user1, User user2) {
        // Check if user1 passed user2 in the last 7 days
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
        List<MatchCandidate> passedCandidates = matchCandidateRepository
                .findByUserAndMatchDateOrderByScoreDesc(user1, LocalDate.now());

        return passedCandidates.stream()
                .filter(c -> c.getCandidateUser().getId().equals(user2.getId()))
                .filter(c -> c.getStatus() == MatchCandidate.CandidateStatus.PASSED)
                .anyMatch(c -> c.getMatchDate().isAfter(sevenDaysAgo));
    }

    private boolean passesPreferenceFilters(User user, User candidate) {
        // Simple preference filtering based on gender/orientation/seeking
        // For v1, keep it simple - can be extended later
        if (user.getSeeking() == null || candidate.getGender() == null) {
            return true; // No preference set, allow all
        }

        String seeking = user.getSeeking().toUpperCase();
        String candidateGender = candidate.getGender().toUpperCase();

        if ("EVERYONE".equals(seeking)) {
            return true;
        }
        if ("MEN".equals(seeking) && "M".equals(candidateGender)) {
            return true;
        }
        if ("WOMEN".equals(seeking) && ("F".equals(candidateGender) || "W".equals(candidateGender))) {
            return true;
        }

        return false;
    }

    private boolean hasCompletedQuestionnaire(User user) {
        return answerRepository.existsByUser(user);
    }

    private void createMatch(User user1, User user2) {
        // Check if match already exists
        Optional<Match> existing = matchRepository.findByUserAAndUserB(user1, user2);
        if (existing.isPresent() && existing.get().getIsActive()) {
            return; // Already matched
        }

        existing = matchRepository.findByUserBAndUserA(user1, user2);
        if (existing.isPresent() && existing.get().getIsActive()) {
            return; // Already matched (reverse)
        }

        // Create match (ensure consistent ordering: smaller id first)
        User userA = user1.getId() < user2.getId() ? user1 : user2;
        User userB = user1.getId() < user2.getId() ? user2 : user1;

        Match match = Match.builder()
                .userA(userA)
                .userB(userB)
                .isActive(true)
                .build();

        matchRepository.save(match);

        // Create chat room
        ChatRoom chatRoom = chatService.getOrCreateChatRoom(user1.getUsername(), user2.getUsername());
        chatRoom.setMode(MatchmakingMode.DATING);
        chatRoom.setIsActive(true);
        chatRoomRepository.save(chatRoom);

        // Notify both users via WebSocket
        UserProfileDTO user1Profile = buildUserProfile(user1);
        UserProfileDTO user2Profile = buildUserProfile(user2);

        messagingTemplate.convertAndSend("/topic/user/" + user1.getUsername() + "/match",
                Map.of("matchFound", true, "roomId", chatRoom.getRoomId(), "otherUser", user2Profile));

        messagingTemplate.convertAndSend("/topic/user/" + user2.getUsername() + "/match",
                Map.of("matchFound", true, "roomId", chatRoom.getRoomId(), "otherUser", user1Profile));

        log.info("Match created between {} and {}", user1.getUsername(), user2.getUsername());
    }

    private IntroductionDTO toIntroductionDTO(MatchCandidate candidate) {
        Map<String, Object> reasons = new HashMap<>();
        try {
            if (candidate.getReasonsJson() != null) {
                reasons = objectMapper.readValue(candidate.getReasonsJson(), Map.class);
            }
        } catch (Exception e) {
            log.warn("Error parsing reasons JSON", e);
        }

        List<String> signals = (List<String>) reasons.getOrDefault("signals", List.of());
        List<String> reasonsList = (List<String>) reasons.getOrDefault("reasons", List.of());

        return IntroductionDTO.builder()
                .candidateId(candidate.getId())
                .candidate(buildUserProfile(candidate.getCandidateUser()))
                .score(candidate.getScore())
                .signals(signals)
                .reasons(reasonsList)
                .status(candidate.getStatus().name())
                .build();
    }

    private UserProfileDTO buildUserProfile(User user) {
        return UserProfileDTO.builder()
                .username(user.getUsername())
                .age(user.getAge())
                .country(user.getCountry())
                .city(user.getCity())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    private static class CandidateScore {
        final User candidate;
        final double score;
        final Map<String, Object> reasons;

        CandidateScore(User candidate, double score, Map<String, Object> reasons) {
            this.candidate = candidate;
            this.score = score;
            this.reasons = reasons;
        }
    }
}

