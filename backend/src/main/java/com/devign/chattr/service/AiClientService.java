package com.devign.chattr.service;

import com.devign.chattr.dto.*;
import com.devign.chattr.model.MatchmakingMode;
import com.devign.chattr.model.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AiClientService {

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    @Autowired
    private ObjectMapper objectMapper;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<AiBatchScoreResponse.ScoreResult> batchScore(User user, MatchmakingPreferencesDTO prefs, List<User> candidates) {
        try {
            Map<String, Object> userProfile = buildUserProfile(user, prefs);
            
            List<Map<String, Object>> candidateProfiles = candidates.stream()
                    .map(candidate -> buildUserProfile(candidate, null))
                    .collect(Collectors.toList());

            AiBatchScoreRequest request = AiBatchScoreRequest.builder()
                    .user(userProfile)
                    .candidates(candidateProfiles)
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<AiBatchScoreRequest> httpEntity = new HttpEntity<>(request, headers);

            String url = aiServiceUrl + "/batch-score";
            log.info("Calling AI service: {}", url);
            
            ResponseEntity<AiBatchScoreResponse> response = restTemplate.postForEntity(
                    url, httpEntity, AiBatchScoreResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody().getResults();
            }

            log.warn("AI service returned non-2xx response: {}", response.getStatusCode());
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Error calling AI batch-score service", e);
            // Fallback: return empty results or simple scoring
            return new ArrayList<>();
        }
    }

    public List<String> generateOpeners(User user, User match, List<String> sharedInterests, MatchmakingMode mode) {
        try {
            Map<String, Object> userProfile = buildUserProfile(user, null);
            Map<String, Object> matchProfile = buildUserProfile(match, null);

            AiGenerateOpenersRequest request = AiGenerateOpenersRequest.builder()
                    .user(userProfile)
                    .match(matchProfile)
                    .shared_interests(sharedInterests)
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<AiGenerateOpenersRequest> httpEntity = new HttpEntity<>(request, headers);

            String url = aiServiceUrl + "/generate-openers";
            log.info("Calling AI service: {}", url);
            
            ResponseEntity<AiGenerateOpenersResponse> response = restTemplate.postForEntity(
                    url, httpEntity, AiGenerateOpenersResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody().getOpeners();
            }

            log.warn("AI service returned non-2xx response: {}", response.getStatusCode());
            return getDefaultOpeners(sharedInterests);
        } catch (Exception e) {
            log.error("Error calling AI generate-openers service", e);
            return getDefaultOpeners(sharedInterests);
        }
    }

    private Map<String, Object> buildUserProfile(User user, MatchmakingPreferencesDTO prefs) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("username", user.getUsername());
        profile.put("bio", user.getBio() != null ? user.getBio() : "");
        profile.put("age", user.getAge());
        profile.put("country", user.getCountry());
        profile.put("city", user.getCity());
        
        // Parse interests from preferences or use empty list
        List<String> interests = new ArrayList<>();
        if (prefs != null && prefs.getInterests() != null) {
            interests = prefs.getInterests();
        }
        profile.put("interests", interests);
        
        if (prefs != null && prefs.getMode() != null) {
            profile.put("mode", prefs.getMode().toString());
        }
        
        return profile;
    }

    private List<String> getDefaultOpeners(List<String> sharedInterests) {
        List<String> defaultOpeners = new ArrayList<>();
        if (sharedInterests != null && !sharedInterests.isEmpty()) {
            String firstInterest = sharedInterests.get(0);
            defaultOpeners.add("Hey! I noticed we both like " + firstInterest + ". What got you into it?");
            if (sharedInterests.size() > 1) {
                defaultOpeners.add("We have " + sharedInterests.size() + " interests in common! That's cool.");
            }
        } else {
            defaultOpeners.add("Hey! Nice to meet you. How's your day going?");
            defaultOpeners.add("Hi there! What's something interesting about you?");
        }
        return defaultOpeners;
    }
}


