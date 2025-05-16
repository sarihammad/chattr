package com.devign.chattr.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MatchmakingService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void startMatchmaking(String username, String genderPreference, String purposePreference) {
        MatchmakingPreferences preferences = new MatchmakingPreferences(genderPreference, purposePreference);
        redisTemplate.opsForValue().set(username, preferences);

        Optional<String> match = findMatch(username);
        match.ifPresent(otherUsername -> {
            messagingTemplate.convertAndSend("/topic/messages", username + " matched with " + otherUsername);
            messagingTemplate.convertAndSend("/topic/messages", otherUsername + " matched with " + username);
        });
    }

    public void cancelMatchmaking(String username) {
        Optional<String> match = findMatch(username);

        redisTemplate.delete(username);

        match.ifPresent(otherUser -> {
            redisTemplate.delete(otherUser);
            messagingTemplate.convertAndSend("/topic/messages", username + " has canceled matchmaking with you.");
        });
    }

    public Optional<String> findMatch(String username) {
        MatchmakingPreferences userPref = (MatchmakingPreferences) redisTemplate.opsForValue().get(username);

        if (userPref == null) return Optional.empty();

        for (String key : redisTemplate.keys("*")) {
            if (!key.equals(username)) {
                MatchmakingPreferences otherPref = (MatchmakingPreferences) redisTemplate.opsForValue().get(key);
                if (otherPref.getGenderPreference().equals(userPref.getGenderPreference())
                        && otherPref.getPurposePreference().equals(userPref.getPurposePreference())) {
                    return Optional.of(key);
                }
            }
        }
        return Optional.empty();
    }

    private static class MatchmakingPreferences {
        private final String genderPreference;
        private final String purposePreference;

        public MatchmakingPreferences(String genderPreference, String purposePreference) {
            this.genderPreference = genderPreference;
            this.purposePreference = purposePreference;
        }

        public String getGenderPreference() {
            return genderPreference;
        }

        public String getPurposePreference() {
            return purposePreference;
        }
    }
}