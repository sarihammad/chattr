package com.devign.chattr.controller;

import com.devign.chattr.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/messages")
public class MessageStatusController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/delivered")
    public ResponseEntity<String> isMessageDelivered(@RequestParam Long messageId) {
        boolean status = notificationService.isDelivered(messageId);
        return ResponseEntity.ok(status ? "Delivered" : "Not Delivered");
    }

    @PostMapping("/delivered")
    public ResponseEntity<String> markMessageAsDelivered(@RequestParam Long messageId) {
        notificationService.markAsDelivered(messageId);
        return ResponseEntity.ok("Marked as delivered");
    }

    @PostMapping("/read")
    public ResponseEntity<String> markMessageAsRead(@RequestParam Long messageId) {
        notificationService.markAsRead(messageId);
        return ResponseEntity.ok("Marked as read");
    }

    @GetMapping("/read")
    public ResponseEntity<String> isMessageRead(@RequestParam Long messageId) {
        boolean status = notificationService.isRead(messageId);
        return ResponseEntity.ok(status ? "Read" : "Not Read");
    }
}