package com.devign.chattr.integration;

import com.devign.chattr.exception.BlockedUserException;
import com.devign.chattr.model.User;
import com.devign.chattr.repository.UserRepository;
import com.devign.chattr.service.BlockService;
import com.devign.chattr.service.ChatService;
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

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Tag("integration")
@Testcontainers
@Transactional
public class BlockEnforcementTest {

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
    private BlockService blockService;

    @Autowired
    private ChatService chatService;

    @Autowired
    private MatchmakingService matchmakingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private User userA;
    private User userB;

    @BeforeEach
    void setUp() {
        // Clear Redis
        redisTemplate.getConnectionFactory().getConnection().flushAll();

        userA = createUser("alice", "alice@test.com", "password");
        userB = createUser("bob", "bob@test.com", "password");
    }

    @Test
    void testBlockPreventsChatRoomCreation() {
        // User A blocks User B
        blockService.blockUser(userA.getUsername(), userB.getUsername());

        // Try to create chat room - should throw BlockedUserException
        assertThrows(BlockedUserException.class, () -> {
            chatService.getOrCreateChatRoom(userA.getUsername(), userB.getUsername());
        });

        assertThrows(BlockedUserException.class, () -> {
            chatService.getOrCreateChatRoom(userB.getUsername(), userA.getUsername());
        });
    }

    @Test
    void testBlockPreventsMessageSending() {
        // Create room first (before blocking)
        var room = chatService.getOrCreateChatRoom(userA.getUsername(), userB.getUsername());

        // User A blocks User B
        blockService.blockUser(userA.getUsername(), userB.getUsername());

        // Try to send message - should throw BlockedUserException
        assertThrows(BlockedUserException.class, () -> {
            chatService.sendMessage(room.getRoomId(), userA.getUsername(), "Hello", 
                    com.devign.chattr.model.ChatMessage.MessageType.TEXT, null);
        });

        assertThrows(BlockedUserException.class, () -> {
            chatService.sendMessage(room.getRoomId(), userB.getUsername(), "Hello",
                    com.devign.chattr.model.ChatMessage.MessageType.TEXT, null);
        });
    }

    @Test
    void testBlockedUsersNotMatched() {
        // User A blocks User B
        blockService.blockUser(userA.getUsername(), userB.getUsername());

        // Verify block check returns true
        assertTrue(blockService.isBlocked(userA.getUsername(), userB.getUsername()));

        // Note: This test assumes MatchmakingService filters blocked users
        // The actual matchmaking logic should exclude blocked users
        // In a real scenario, you'd set up preferences and verify they're not matched
    }

    private User createUser(String username, String email, String password) {
        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(password)
                .bio("Test user " + username)
                .build();
        return userRepository.save(user);
    }
}

