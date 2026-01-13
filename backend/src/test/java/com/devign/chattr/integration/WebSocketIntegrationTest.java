package com.devign.chattr.integration;

import com.devign.chattr.model.ChatMessage;
import com.devign.chattr.model.ChatRoom;
import com.devign.chattr.model.User;
import com.devign.chattr.repository.ChatRoomRepository;
import com.devign.chattr.repository.UserRepository;
import com.devign.chattr.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.Transport;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Tag("integration")
public class WebSocketIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private WebSocketStompClient stompClient;
    private StompSession stompSession;

    @BeforeEach
    public void setup() throws Exception {
        List<Transport> transports = new ArrayList<>();
        transports.add(new WebSocketTransport(new StandardWebSocketClient()));
        stompClient = new WebSocketStompClient(new SockJsClient(transports));
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());

        String token = jwtUtil.generateToken("testuser");
        StompHeaders connectHeaders = new StompHeaders();
        connectHeaders.add("Authorization", "Bearer " + token);

        stompSession = stompClient.connectAsync("ws://localhost:8080/ws", 
            new StompSessionHandlerAdapter() {}, connectHeaders)
            .get(1, SECONDS);
    }

    @Test
    public void testSendAndReceiveMessage() throws ExecutionException, InterruptedException, TimeoutException {
        //Create test users and chat room
        User user1 = new User();
        user1.setUsername("user1");
        userRepository.save(user1);

        User user2 = new User();
        user2.setUsername("user2");
        userRepository.save(user2);

        ChatRoom chatRoom = ChatRoom.builder()
                .roomId("test-room")
                .user1(user1)
                .user2(user2)
                .build();
        chatRoomRepository.save(chatRoom);

        //Subscribe to chat room
        CompletableFuture<ChatMessage> messageFuture = new CompletableFuture<>();
        stompSession.subscribe("/topic/chat/test-room", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return ChatMessage.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                messageFuture.complete((ChatMessage) payload);
            }
        });

        //Send message
        ChatMessage message = ChatMessage.builder()
                .sender("user1")
                .receiver("user2")
                .content("Hello!")
                .type(ChatMessage.MessageType.TEXT)
                .build();

        stompSession.send("/app/chat/test-room", message);

        //Wait for message
        ChatMessage receivedMessage = messageFuture.get(5, SECONDS);
        assertNotNull(receivedMessage);
        assertEquals("Hello!", receivedMessage.getContent());
        assertEquals("user1", receivedMessage.getSender());
        assertEquals("user2", receivedMessage.getReceiver());
    }
} 
