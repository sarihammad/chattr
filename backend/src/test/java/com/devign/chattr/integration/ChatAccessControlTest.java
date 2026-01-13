package com.devign.chattr.integration;

import com.devign.chattr.exception.UnauthorizedException;
import com.devign.chattr.model.ChatMessage;
import com.devign.chattr.model.ChatRoom;
import com.devign.chattr.model.User;
import com.devign.chattr.repository.ChatMessageRepository;
import com.devign.chattr.repository.ChatRoomRepository;
import com.devign.chattr.repository.UserRepository;
import com.devign.chattr.service.ChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
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
public class ChatAccessControlTest {

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
    private ChatService chatService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    private User userA;
    private User userB;
    private User userC;
    private ChatRoom roomAB;

    @BeforeEach
    void setUp() {
        userA = createUser("alice", "alice@test.com", "password");
        userB = createUser("bob", "bob@test.com", "password");
        userC = createUser("carol", "carol@test.com", "password");

        // Create chat room between A and B
        roomAB = chatService.getOrCreateChatRoom(userA.getUsername(), userB.getUsername());
    }

    @Test
    void testUserCanAccessOwnChatHistory() {
        // Send a message
        chatService.sendMessage(roomAB.getRoomId(), userA.getUsername(), "Hello", 
                ChatMessage.MessageType.TEXT, null);

        // User A should be able to access chat history
        var messagesA = chatService.getChatHistory(roomAB.getRoomId(), userA.getUsername(), 
                PageRequest.of(0, 10));
        assertFalse(messagesA.isEmpty());

        // User B should be able to access chat history
        var messagesB = chatService.getChatHistory(roomAB.getRoomId(), userB.getUsername(),
                PageRequest.of(0, 10));
        assertFalse(messagesB.isEmpty());
    }

    @Test
    void testUserCannotAccessOtherUsersChatHistory() {
        // Send a message
        chatService.sendMessage(roomAB.getRoomId(), userA.getUsername(), "Hello",
                ChatMessage.MessageType.TEXT, null);

        // User C should NOT be able to access chat history
        assertThrows(UnauthorizedException.class, () -> {
            chatService.getChatHistory(roomAB.getRoomId(), userC.getUsername(),
                    PageRequest.of(0, 10));
        });
    }

    @Test
    void testUserCanMarkOwnMessagesAsRead() {
        // Send a message from A to B
        chatService.sendMessage(roomAB.getRoomId(), userA.getUsername(), "Hello",
                ChatMessage.MessageType.TEXT, null);

        // User B should be able to mark messages as read
        assertDoesNotThrow(() -> {
            chatService.markMessagesAsRead(roomAB.getRoomId(), userB.getUsername());
        });
    }

    @Test
    void testUserCannotMarkMessagesAsReadForOtherRoom() {
        // Send a message
        chatService.sendMessage(roomAB.getRoomId(), userA.getUsername(), "Hello",
                ChatMessage.MessageType.TEXT, null);

        // User C should NOT be able to mark messages as read
        assertThrows(UnauthorizedException.class, () -> {
            chatService.markMessagesAsRead(roomAB.getRoomId(), userC.getUsername());
        });
    }

    @Test
    void testUserCannotSendMessageToRoomTheyAreNotIn() {
        // User C should NOT be able to send message to room AB
        assertThrows(UnauthorizedException.class, () -> {
            chatService.sendMessage(roomAB.getRoomId(), userC.getUsername(), "Hello",
                    ChatMessage.MessageType.TEXT, null);
        });
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

