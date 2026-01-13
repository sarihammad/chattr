package com.devign.chattr.controller;

import com.devign.chattr.model.ChatMessage;
import com.devign.chattr.service.ChatService;
import com.devign.chattr.service.UserPresenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class WebSocketChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserPresenceService userPresenceService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{roomId}/send")
    public void sendMessage(
            @DestinationVariable String roomId,
            @Payload Map<String, Object> payload,
            SimpMessageHeaderAccessor headerAccessor) {
        // Get username from session attributes set during handshake
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        if (username == null) {
            return; // Not authenticated
        }

        String content = (String) payload.get("content");
        String typeStr = (String) payload.get("type");
        ChatMessage.MessageType type = typeStr != null 
                ? ChatMessage.MessageType.valueOf(typeStr) 
                : ChatMessage.MessageType.TEXT;
        String mediaUrl = (String) payload.get("mediaUrl");

        ChatMessage savedMessage = chatService.sendMessage(
            roomId,
            username,
            content,
            type,
            mediaUrl
        );
    }

    @MessageMapping("/chat/{roomId}/typing")
    public void typing(
            @DestinationVariable String roomId,
            SimpMessageHeaderAccessor headerAccessor) {
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        if (username == null) {
            return;
        }
        Map<String, Object> typingData = Map.of("username", username, "status", "typing");
        messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/typing", typingData);
    }

    @MessageMapping("/chat/{roomId}/read")
    public void markAsRead(
            @DestinationVariable String roomId,
            SimpMessageHeaderAccessor headerAccessor) {
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        if (username == null) {
            return;
        }
        chatService.markMessagesAsRead(roomId, username);
        Map<String, Object> readData = Map.of("username", username, "timestamp", System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/read", readData);
    }

    @MessageMapping("/presence")
    public void handlePresence(SimpMessageHeaderAccessor headerAccessor) {
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        if (username != null) {
            userPresenceService.userConnected(username);
        }
    }

    @MessageMapping("/disconnect")
    public void handleDisconnect(SimpMessageHeaderAccessor headerAccessor) {
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        if (username != null) {
            userPresenceService.userDisconnected(username);
        }
    }
}