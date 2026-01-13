package com.devign.chattr.integration;

import com.devign.chattr.model.*;
import com.devign.chattr.repository.*;
import com.devign.chattr.service.MatchmakingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
@Transactional
@Tag("integration")
public class MatchmakingIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            DockerImageName.parse("postgres:15-alpine"))
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private MatchmakingService matchmakingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MatchmakingPreferencesRepository preferencesRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private User user1;
    private User user2;
    private User user3;

    @BeforeEach
    void setUp() {
        // Clear Redis
        redisTemplate.getConnectionFactory().getConnection().flushAll();

        // Create test users
        user1 = createUser("alice", "alice@test.com", "password", 24, "CA", "Toronto");
        user2 = createUser("bob", "bob@test.com", "password", 25, "CA", "Toronto");
        user3 = createUser("carol", "carol@test.com", "password", 22, "US", "New York");

        // Create preferences
        createPreferences(user1, MatchmakingMode.FRIENDS, "CA", "Toronto", 
                Arrays.asList("music", "coding"), 20, 30);
        createPreferences(user2, MatchmakingMode.FRIENDS, "CA", "Toronto",
                Arrays.asList("music", "coding"), 20, 30);
        createPreferences(user3, MatchmakingMode.FRIENDS, "US", "New York",
                Arrays.asList("music"), 20, 30);
    }

    @Test
    void testMatchmakingFlow() {
        // Start matchmaking for user1
        var response = matchmakingService.startMatchmaking(user1.getUsername());

        // Check if a match was found or searching
        assertNotNull(response);
        
        // Check Redis for active match or queue membership
        String activeRoomId = redisTemplate.opsForValue().get("matchmaking:active:" + user1.getUsername());
        if (activeRoomId != null) {
            // Match was found
            assertTrue(response.getMatchFound());
            assertNotNull(response.getRoomId());
            
            // Verify ChatRoom exists in DB
            assertTrue(chatRoomRepository.findByRoomId(response.getRoomId()).isPresent());
            
            // Verify both users have active match keys
            assertNotNull(redisTemplate.opsForValue().get("matchmaking:active:" + user1.getUsername()));
        } else {
            // No match yet, user should be in queue
            assertFalse(response.getMatchFound());
            String queueKey = "matchmaking:queue:FRIENDS:CA";
            assertTrue(Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(queueKey, user1.getUsername())));
        }
    }

    @Test
    void testStatusEndpoint() {
        // Start matchmaking
        matchmakingService.startMatchmaking(user1.getUsername());
        
        // Get status
        var status = matchmakingService.getStatus(user1.getUsername());
        assertNotNull(status);
        assertTrue(status.getStatus().equals("SEARCHING") || status.getStatus().equals("MATCHED"));
    }

    @Test
    void testStopMatchmaking() {
        // Start matchmaking
        matchmakingService.startMatchmaking(user1.getUsername());
        
        // Stop matchmaking
        matchmakingService.stopMatchmaking(user1.getUsername());
        
        // Verify user is removed from queue
        String queueKey = "matchmaking:queue:FRIENDS:CA";
        assertFalse(Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(queueKey, user1.getUsername())));
        
        // Verify active match key is removed
        assertNull(redisTemplate.opsForValue().get("matchmaking:active:" + user1.getUsername()));
    }

    private User createUser(String username, String email, String password, Integer age, 
                           String country, String city) {
        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(password)
                .age(age)
                .country(country)
                .city(city)
                .bio("Test user " + username)
                .build();
        return userRepository.save(user);
    }

    private void createPreferences(User user, MatchmakingMode mode, String country, String city,
                                  List<String> interests, Integer minAge, Integer maxAge) {
        MatchmakingPreferences prefs = MatchmakingPreferences.builder()
                .user(user)
                .mode(mode)
                .age(user.getAge())
                .country(country)
                .city(city)
                .interests(String.join(",", interests))
                .minAge(minAge)
                .maxAge(maxAge)
                .openToAny(false)
                .build();
        preferencesRepository.save(prefs);
    }
}
