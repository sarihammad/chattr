package com.devign.chattr.controller;

import com.devign.chattr.dto.ChatRoomDTO;
import com.devign.chattr.dto.UserProfileDTO;
import com.devign.chattr.model.ChatRoom;
import com.devign.chattr.model.Match;
import com.devign.chattr.model.User;
import com.devign.chattr.repository.ChatRoomRepository;
import com.devign.chattr.repository.MatchRepository;
import com.devign.chattr.repository.UserRepository;
import com.devign.chattr.util.AuthUtil;
import com.devign.chattr.exception.NotFoundException;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchRepository matchRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final AuthUtil authUtil;

    /**
     * Get user's active matches.
     */
    @GetMapping
    public ResponseEntity<List<MatchResponse>> getMatches(@RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));

        List<Match> matches = matchRepository.findActiveMatchesByUser(user);
        
        List<MatchResponse> responses = matches.stream()
                .map(match -> {
                    User otherUser = match.getUserA().getId().equals(user.getId()) 
                            ? match.getUserB() 
                            : match.getUserA();
                    
                    // Find chat room for this match
                    ChatRoom chatRoom = chatRoomRepository.findChatRoomByUsers(
                            user.getUsername(), otherUser.getUsername())
                            .orElse(null);

                    return MatchResponse.builder()
                            .matchId(match.getId())
                            .otherUser(buildUserProfile(otherUser))
                            .matchedAt(match.getMatchedAt())
                            .roomId(chatRoom != null ? chatRoom.getRoomId() : null)
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    /**
     * Get a specific match by ID.
     */
    @GetMapping("/{matchId}")
    public ResponseEntity<MatchResponse> getMatch(
            @PathVariable Long matchId,
            @RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new NotFoundException("Match not found: " + matchId));

        // Verify user is part of this match
        if (!match.getUserA().getId().equals(user.getId()) && 
            !match.getUserB().getId().equals(user.getId())) {
            throw new com.devign.chattr.exception.UnauthorizedException("Not authorized to view this match");
        }

        User otherUser = match.getUserA().getId().equals(user.getId()) 
                ? match.getUserB() 
                : match.getUserA();

        ChatRoom chatRoom = chatRoomRepository.findChatRoomByUsers(
                user.getUsername(), otherUser.getUsername())
                .orElse(null);

        MatchResponse response = MatchResponse.builder()
                .matchId(match.getId())
                .otherUser(buildUserProfile(otherUser))
                .matchedAt(match.getMatchedAt())
                .roomId(chatRoom != null ? chatRoom.getRoomId() : null)
                .build();

        return ResponseEntity.ok(response);
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

    @Data
    @Builder
    public static class MatchResponse {
        private Long matchId;
        private UserProfileDTO otherUser;
        private java.time.LocalDateTime matchedAt;
        private String roomId;
    }
}

