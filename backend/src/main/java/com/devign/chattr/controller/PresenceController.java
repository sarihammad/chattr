package com.devign.chattr.controller;

import com.devign.chattr.service.UserPresenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/presence")
public class PresenceController {

    @Autowired
    private UserPresenceService userPresenceService;

    @GetMapping("/online-users")
    public ResponseEntity<Set<String>> getOnlineUsers() {
        Set<String> onlineUsers = userPresenceService.getOnlineUsers();
        return ResponseEntity.ok(onlineUsers);
    }

    @GetMapping("/{username}")
    public ResponseEntity<Map<String, Boolean>> getUserPresence(@PathVariable String username) {
        boolean isOnline = userPresenceService.isUserOnline(username);
        return ResponseEntity.ok(Map.of("online", isOnline));
    }
}


