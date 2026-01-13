package com.devign.chattr.service;

import com.devign.chattr.dto.MatchmakingPreferencesDTO;
import com.devign.chattr.model.*;
import com.devign.chattr.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchmakingServiceTest {

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MatchmakingPreferencesRepository preferencesRepository;

    @Mock
    private BlockRepository blockRepository;

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private ConversationOpenerRepository openerRepository;

    @Mock
    private AiClientService aiClientService;

    @Mock
    private ChatService chatService;

    @Mock
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @InjectMocks
    private MatchmakingService matchmakingService;

    private User testUser;
    private MatchmakingPreferences testPreferences;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("password")
                .gender("M")
                .isOnline(false)
                .build();

        testPreferences = MatchmakingPreferences.builder()
                .id(1L)
                .user(testUser)
                .mode(MatchmakingMode.DATING)
                .country("CA")
                .build();
    }

    @Test
    void testUpdatePreferences() throws Exception {
        // Given
        MatchmakingPreferencesDTO dto = MatchmakingPreferencesDTO.builder()
                .mode(MatchmakingMode.DATING)
                .country("CA")
                .build();

        org.springframework.data.redis.core.ValueOperations<String, String> valueOps = 
                mock(org.springframework.data.redis.core.ValueOperations.class);
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(preferencesRepository.findByUser(testUser)).thenReturn(Optional.empty());
        when(preferencesRepository.save(any(MatchmakingPreferences.class))).thenReturn(testPreferences);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        
        // Inject ObjectMapper via reflection
        org.springframework.test.util.ReflectionTestUtils.setField(matchmakingService, "objectMapper", objectMapper);

        // When
        matchmakingService.updatePreferences("testuser", dto);

        // Then
        verify(preferencesRepository, times(1)).save(any(MatchmakingPreferences.class));
        verify(redisTemplate, times(1)).opsForValue();
        verify(valueOps, times(1)).set(anyString(), anyString());
    }

    @Test
    void testUpdatePreferences_UserNotFound() {
        // Given
        MatchmakingPreferencesDTO dto = MatchmakingPreferencesDTO.builder()
                .mode(MatchmakingMode.DATING)
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When/Then
        assertThrows(RuntimeException.class, () -> {
            matchmakingService.updatePreferences("testuser", dto);
        });
    }

    @Test
    void testStopMatchmaking() {
        // Given
        when(redisTemplate.opsForValue()).thenReturn(mock(org.springframework.data.redis.core.ValueOperations.class));
        when(redisTemplate.opsForValue().get(anyString())).thenReturn(null);

        // When
        matchmakingService.stopMatchmaking("testuser");

        // Then
        verify(redisTemplate, atLeastOnce()).delete(anyString());
    }
}


