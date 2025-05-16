package com.devign.chattr.controller;

import com.devign.chattr.model.ChatMessage;
import com.devign.chattr.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/unread")
    public ResponseEntity<List<ChatMessage>> getUnreadMessages(@RequestParam String username) {
        List<ChatMessage> unreadMessages = notificationService.getUnreadMessages(username);
        return ResponseEntity.ok(unreadMessages);
    }

    @PostMapping("/mark-delivered")
    public ResponseEntity<String> markMessagesAsDelivered(@RequestParam String username) {
        notificationService.markAsDelivered(username);
        return ResponseEntity.ok("All messages marked as delivered.");
    }
}