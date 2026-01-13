package com.devign.chattr.service;

import com.devign.chattr.dto.*;
import com.devign.chattr.exception.NotFoundException;
import com.devign.chattr.exception.BlockedUserException;
import com.devign.chattr.exception.MatchmakingException;
import com.devign.chattr.model.*;
import com.devign.chattr.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MatchmakingService {
    
    private static final String PREFERENCES_PREFIX = "matchmaking:prefs:";
    private static final String QUEUE_PREFIX = "matchmaking:queue:";
    private static final String ACTIVE_MATCH_PREFIX = "matchmaking:active:";
    private static final String COOLDOWN_PREFIX = "matchmaking:cooldown:";
    private static final long COOLDOWN_TTL_HOURS = 1;
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private MatchmakingPreferencesRepository preferencesRepository;
    
    @Autowired
    private ChatRoomRepository chatRoomRepository;
    
    @Autowired
    private ConversationOpenerRepository openerRepository;
    
    @Autowired
    private AiClientService aiClientService;
    
    @Autowired
    private ChatService chatService;
    
    @Autowired
    private BlockService blockService;
    
    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public void updatePreferences(String username, MatchmakingPreferencesDTO dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));

        MatchmakingPreferences prefs = preferencesRepository.findByUser(user)
                .orElse(MatchmakingPreferences.builder().user(user).build());

        prefs.setMode(dto.getMode());
        prefs.setAge(dto.getAge() != null ? dto.getAge() : user.getAge());
        prefs.setCountry(dto.getCountry() != null ? dto.getCountry() : user.getCountry());
        prefs.setCity(dto.getCity() != null ? dto.getCity() : user.getCity());
        prefs.setMinAge(dto.getMinAge());
        prefs.setMaxAge(dto.getMaxAge());
        prefs.setAllowedCountries(serializeList(dto.getAllowedCountries()));
        prefs.setInterests(serializeList(dto.getInterests()));
        prefs.setOpenToAny(dto.getOpenToAny() != null ? dto.getOpenToAny() : false);

        preferencesRepository.save(prefs);

        // Cache in Redis
        cachePreferences(username, prefs);
    }

    @Transactional
    public MatchResponse startMatchmaking(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));

        MatchmakingPreferences prefs = preferencesRepository.findByUser(user)
                .orElseThrow(() -> new MatchmakingException("Preferences not found for user: " + username + ". Please set your preferences first."));

        // Cache preferences if not cached
        cachePreferences(username, prefs);

        // Add to queue
        String queueKey = buildQueueKey(prefs.getMode(), prefs.getCountry());
        redisTemplate.opsForSet().add(queueKey, username);

        // Try to find a match
        return attemptMatch(username, prefs);
    }

    @Transactional
    public MatchResponse attemptMatch(String username, MatchmakingPreferences prefs) {
        // Get candidates from queue
        List<String> candidateUsernames = getCandidatesFromQueue(prefs.getMode(), prefs.getCountry(), username);

        if (candidateUsernames.isEmpty()) {
            return MatchResponse.builder().matchFound(false).build();
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));

        // Filter out blocked users and check cooldowns (both directions)
        List<String> filteredCandidates = candidateUsernames.stream()
                .filter(candidate -> {
                    // Check if either user blocked the other
                    boolean blocked = blockService.isBlocked(username, candidate) || 
                                     blockService.isBlocked(candidate, username);
                    return !blocked;
                })
                .filter(candidate -> !isOnCooldown(username, candidate))
                .collect(Collectors.toList());

        if (filteredCandidates.isEmpty()) {
            return MatchResponse.builder().matchFound(false).build();
        }

        // Load candidate users
        List<User> candidates = filteredCandidates.stream()
                .map(un -> userRepository.findByUsername(un))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());

        // Apply basic filters
        candidates = applyFilters(candidates, prefs);

        if (candidates.isEmpty()) {
            return MatchResponse.builder().matchFound(false).build();
        }

        // Get AI scores
        List<AiBatchScoreResponse.ScoreResult> scores = aiClientService.batchScore(
                user, toDTO(prefs), candidates);

        if (scores.isEmpty()) {
            // Fallback: pick first candidate
            User match = candidates.get(0);
            return createMatch(username, user, match, prefs, 0.5, Collections.emptyList());
        }

        // Sort by score and pick best match
        scores.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        AiBatchScoreResponse.ScoreResult bestScore = scores.get(0);

        if (bestScore.getScore() < 0.3) { // Minimum threshold
            return MatchResponse.builder().matchFound(false).build();
        }

        User match = candidates.stream()
                .filter(c -> c.getUsername().equals(bestScore.getCandidate_username()))
                .findFirst()
                .orElse(candidates.get(0));

        // Remove both from queues
        removeFromQueues(username, prefs.getMode(), prefs.getCountry());
        removeFromQueues(match.getUsername(), prefs.getMode(), prefs.getCountry());

        return createMatch(username, user, match, prefs, bestScore.getScore(),
                bestScore.getShared_interests());
    }

    @Transactional
    private MatchResponse createMatch(String currentUsername, User user1, User user2,
                                     MatchmakingPreferences prefs, Double score, List<String> sharedInterests) {
        // Create chat room
        ChatRoom room = chatService.getOrCreateChatRoom(user1.getUsername(), user2.getUsername());
        room.setMode(prefs.getMode());
        room.setIsActive(true);
        chatRoomRepository.save(room);

        // Set active match for both users
        redisTemplate.opsForValue().set(ACTIVE_MATCH_PREFIX + user1.getUsername(), room.getRoomId());
        redisTemplate.opsForValue().set(ACTIVE_MATCH_PREFIX + user2.getUsername(), room.getRoomId());

        // Generate conversation openers
        List<String> openers = aiClientService.generateOpeners(user1, user2, sharedInterests, prefs.getMode());
        for (String openerText : openers) {
            ConversationOpener opener = ConversationOpener.builder()
                    .room(room)
                    .text(openerText)
                    .build();
            openerRepository.save(opener);
        }

        // Notify both users via WebSocket
        UserProfileDTO otherUser = buildUserProfile(user2);
        MatchResponse matchResponse = MatchResponse.builder()
                .matchFound(true)
                .roomId(room.getRoomId())
                .otherUser(otherUser)
                .sharedInterests(sharedInterests)
                .score(score)
                .build();

        messagingTemplate.convertAndSend("/topic/user/" + user1.getUsername() + "/match", matchResponse);
        messagingTemplate.convertAndSend("/topic/user/" + user2.getUsername() + "/match", 
                MatchResponse.builder()
                        .matchFound(true)
                        .roomId(room.getRoomId())
                        .otherUser(buildUserProfile(user1))
                        .sharedInterests(sharedInterests)
                        .score(score)
                        .build());

        return matchResponse;
    }

    public void stopMatchmaking(String username) {
        MatchmakingPreferences prefs = getCachedPreferences(username);
        if (prefs != null) {
            removeFromQueues(username, prefs.getMode(), prefs.getCountry());
        }
        redisTemplate.delete(ACTIVE_MATCH_PREFIX + username);
    }

    @Transactional
    public void skipMatch(String username, String roomId) {
        ChatRoom room = chatRoomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new NotFoundException("Room not found: " + roomId));

        // Verify user is part of this chat room
        if (!room.getUser1().getUsername().equals(username) &&
            !room.getUser2().getUsername().equals(username)) {
            throw new com.devign.chattr.exception.UnauthorizedException("You are not part of this chat room");
        }

        String otherUsername = room.getUser1().getUsername().equals(username)
                ? room.getUser2().getUsername()
                : room.getUser1().getUsername();

        // Add cooldown
        setCooldown(username, otherUsername);
        setCooldown(otherUsername, username);

        // Remove active matches
        redisTemplate.delete(ACTIVE_MATCH_PREFIX + username);
        redisTemplate.delete(ACTIVE_MATCH_PREFIX + otherUsername);

        // Mark room as inactive
        room.setIsActive(false);
        chatRoomRepository.save(room);
    }

    public MatchmakingStatusResponse getStatus(String username) {
        String activeRoomId = redisTemplate.opsForValue().get(ACTIVE_MATCH_PREFIX + username);
        if (activeRoomId != null) {
            ChatRoom room = chatRoomRepository.findByRoomId(activeRoomId)
                    .orElse(null);
            if (room != null && room.getIsActive()) {
                String otherUsername = room.getUser1().getUsername().equals(username)
                        ? room.getUser2().getUsername()
                        : room.getUser1().getUsername();
                User otherUser = userRepository.findByUsername(otherUsername).orElse(null);
                if (otherUser != null) {
                    return MatchmakingStatusResponse.builder()
                            .status("MATCHED")
                            .match(MatchResponse.builder()
                                    .matchFound(true)
                                    .roomId(room.getRoomId())
                                    .otherUser(buildUserProfile(otherUser))
                                    .build())
                            .build();
                }
            }
        }

        MatchmakingPreferences prefs = getCachedPreferences(username);
        String queueKey = prefs != null ? buildQueueKey(prefs.getMode(), prefs.getCountry()) : null;
        boolean isInQueue = queueKey != null && Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(queueKey, username));

        return MatchmakingStatusResponse.builder()
                .status(isInQueue ? "SEARCHING" : "IDLE")
                .build();
    }

    // Helper methods

    private void cachePreferences(String username, MatchmakingPreferences prefs) {
        try {
            String key = PREFERENCES_PREFIX + username;
            String json = objectMapper.writeValueAsString(prefs);
            redisTemplate.opsForValue().set(key, json);
        } catch (Exception e) {
            log.error("Error caching preferences", e);
        }
    }

    private MatchmakingPreferences getCachedPreferences(String username) {
        try {
            String key = PREFERENCES_PREFIX + username;
            String json = redisTemplate.opsForValue().get(key);
            if (json != null) {
                return objectMapper.readValue(json, MatchmakingPreferences.class);
            }
        } catch (Exception e) {
            log.error("Error reading cached preferences", e);
        }
        return preferencesRepository.findByUser_Username(username).orElse(null);
    }

    private String buildQueueKey(MatchmakingMode mode, String country) {
        if (country != null && !country.isEmpty()) {
            return QUEUE_PREFIX + mode + ":" + country;
        }
        return QUEUE_PREFIX + mode;
    }

    private List<String> getCandidatesFromQueue(MatchmakingMode mode, String country, String excludeUsername) {
        String queueKey = buildQueueKey(mode, country);
        Set<String> members = redisTemplate.opsForSet().members(queueKey);
        if (members == null) return Collections.emptyList();
        
        return members.stream()
                .filter(m -> !m.equals(excludeUsername))
                .collect(Collectors.toList());
    }

    private void removeFromQueues(String username, MatchmakingMode mode, String country) {
        String queueKey = buildQueueKey(mode, country);
        redisTemplate.opsForSet().remove(queueKey, username);
    }

    private boolean isOnCooldown(String userA, String userB) {
        String keyA = COOLDOWN_PREFIX + userA + ":" + userB;
        String keyB = COOLDOWN_PREFIX + userB + ":" + userA;
        return Boolean.TRUE.equals(redisTemplate.hasKey(keyA)) || Boolean.TRUE.equals(redisTemplate.hasKey(keyB));
    }

    private void setCooldown(String userA, String userB) {
        String key = COOLDOWN_PREFIX + userA + ":" + userB;
        redisTemplate.opsForValue().set(key, "1", COOLDOWN_TTL_HOURS, TimeUnit.HOURS);
    }

    private List<User> applyFilters(List<User> candidates, MatchmakingPreferences prefs) {
        return candidates.stream()
                .filter(user -> {
                    if (prefs.getMinAge() != null && (user.getAge() == null || user.getAge() < prefs.getMinAge())) {
                        return false;
                    }
                    if (prefs.getMaxAge() != null && (user.getAge() == null || user.getAge() > prefs.getMaxAge())) {
                        return false;
                    }
                    if (prefs.getOpenToAny()) {
                        return true;
                    }
                    if (prefs.getCountry() != null && !prefs.getCountry().isEmpty()) {
                        List<String> allowedCountries = deserializeList(prefs.getAllowedCountries());
                        if (!allowedCountries.isEmpty() && (user.getCountry() == null || 
                                !allowedCountries.contains(user.getCountry()))) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    private String serializeList(List<String> list) {
        if (list == null || list.isEmpty()) return "[]";
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            log.error("Error serializing list", e);
            return "[]";
        }
    }

    private List<String> deserializeList(String json) {
        if (json == null || json.isEmpty()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.error("Error deserializing list", e);
            return Collections.emptyList();
        }
    }

    private MatchmakingPreferencesDTO toDTO(MatchmakingPreferences prefs) {
        return MatchmakingPreferencesDTO.builder()
                .mode(prefs.getMode())
                .age(prefs.getAge())
                .country(prefs.getCountry())
                .city(prefs.getCity())
                .minAge(prefs.getMinAge())
                .maxAge(prefs.getMaxAge())
                .allowedCountries(deserializeList(prefs.getAllowedCountries()))
                .interests(deserializeList(prefs.getInterests()))
                .openToAny(prefs.getOpenToAny())
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
}
