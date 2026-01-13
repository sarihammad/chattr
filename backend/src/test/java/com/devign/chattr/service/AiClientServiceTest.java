package com.devign.chattr.service;

import com.devign.chattr.dto.AiBatchScoreResponse;
import com.devign.chattr.dto.MatchmakingPreferencesDTO;
import com.devign.chattr.model.MatchmakingMode;
import com.devign.chattr.model.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiClientServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private AiClientService aiClientService;

    private User testUser;
    private MatchmakingPreferencesDTO testPreferences;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(aiClientService, "aiServiceUrl", "http://localhost:8000");
        
        testUser = User.builder()
                .username("testuser")
                .bio("I love coding and music")
                .age(25)
                .country("CA")
                .build();

        testPreferences = MatchmakingPreferencesDTO.builder()
                .mode(MatchmakingMode.DATING)
                .interests(Arrays.asList("coding", "music"))
                .build();
    }

    @Test
    void testBatchScore_Success() {
        // Given
        User candidate = User.builder()
                .username("candidate")
                .bio("I also love coding")
                .build();

        AiBatchScoreResponse response = new AiBatchScoreResponse();
        AiBatchScoreResponse.ScoreResult result = AiBatchScoreResponse.ScoreResult.builder()
                .candidate_username("candidate")
                .score(0.85)
                .shared_interests(Arrays.asList("coding"))
                .build();
        response.setResults(Arrays.asList(result));

        ResponseEntity<AiBatchScoreResponse> responseEntity = new ResponseEntity<>(response, HttpStatus.OK);

        when(restTemplate.postForEntity(anyString(), any(), eq(AiBatchScoreResponse.class)))
                .thenReturn(responseEntity);

        // When
        List<AiBatchScoreResponse.ScoreResult> results = aiClientService.batchScore(
                testUser, testPreferences, Arrays.asList(candidate));

        // Then
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("candidate", results.get(0).getCandidate_username());
        assertEquals(0.85, results.get(0).getScore());
    }

    @Test
    void testBatchScore_ServiceError() {
        // Given
        when(restTemplate.postForEntity(anyString(), any(), eq(AiBatchScoreResponse.class)))
                .thenThrow(new RuntimeException("Service unavailable"));

        // When
        List<AiBatchScoreResponse.ScoreResult> results = aiClientService.batchScore(
                testUser, testPreferences, Arrays.asList());

        // Then - should return empty list on error
        assertNotNull(results);
        assertTrue(results.isEmpty());
    }

    @Test
    void testGenerateOpeners_Success() {
        // Given
        User match = User.builder()
                .username("match")
                .bio("I love music too")
                .build();

        List<String> sharedInterests = Arrays.asList("music");

        AiBatchScoreResponse response = new AiBatchScoreResponse();
        ResponseEntity<AiBatchScoreResponse> responseEntity = new ResponseEntity<>(response, HttpStatus.OK);

        // When
        List<String> openers = aiClientService.generateOpeners(
                testUser, match, sharedInterests, MatchmakingMode.DATING);

        // Then - should return default openers if service fails
        assertNotNull(openers);
        assertFalse(openers.isEmpty());
    }
}


