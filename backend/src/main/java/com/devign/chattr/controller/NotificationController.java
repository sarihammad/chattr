package com.devign.chattr.controller;

import com.devign.chattr.dto.ChatMessageDTO;
import com.devign.chattr.mapper.ChatMapper;
import com.devign.chattr.service.NotificationService;
import com.devign.chattr.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final ChatMapper chatMapper;
    private final AuthUtil authUtil;

    @GetMapping("/unread")
    public ResponseEntity<List<ChatMessageDTO>> getUnreadMessages(
            @RequestParam String username,
            @RequestHeader("Authorization") String token) {
        String authenticatedUsername = authUtil.getUsernameFromToken(token);
        // Verify requester is requesting their own unread messages
        if (!authenticatedUsername.equals(username)) {
            throw new com.devign.chattr.exception.UnauthorizedException("You can only view your own unread messages");
        }
        List<com.devign.chattr.model.ChatMessage> unreadMessages = notificationService.getUnreadMessages(username);
        List<ChatMessageDTO> unreadDTOs = unreadMessages.stream()
                .map(chatMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(unreadDTOs);
    }

    @PostMapping("/mark-delivered")
    public ResponseEntity<Map<String, String>> markMessagesAsDelivered(
            @RequestParam String username,
            @RequestHeader("Authorization") String token) {
        String authenticatedUsername = authUtil.getUsernameFromToken(token);
        // Verify requester is marking their own messages as delivered
        if (!authenticatedUsername.equals(username)) {
            throw new com.devign.chattr.exception.UnauthorizedException("You can only mark your own messages as delivered");
        }
        notificationService.markAsDelivered(username);
        return ResponseEntity.ok(Map.of("status", "success", "message", "All messages marked as delivered"));
    }
}
