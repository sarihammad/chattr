package com.devign.chattr.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
public class UserPresenceService {

    private static final String ONLINE_USERS_KEY = "online:users";
    private static final String USER_PRESENCE_KEY = "user:presence:";
    private static final long PRESENCE_TIMEOUT = 30; // seconds

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void userConnected(String username) {
        String userKey = USER_PRESENCE_KEY + username;
        redisTemplate.opsForValue().set(userKey, "online", PRESENCE_TIMEOUT, TimeUnit.SECONDS);
        redisTemplate.opsForSet().add(ONLINE_USERS_KEY, username);
        broadcastUserStatus(username, true);
    }

    public void userDisconnected(String username) {
        String userKey = USER_PRESENCE_KEY + username;
        redisTemplate.delete(userKey);
        redisTemplate.opsForSet().remove(ONLINE_USERS_KEY, username);
        broadcastUserStatus(username, false);
    }

    public boolean isUserOnline(String username) {
        String userKey = USER_PRESENCE_KEY + username;
        return Boolean.TRUE.equals(redisTemplate.hasKey(userKey));
    }

    public Set<String> getOnlineUsers() {
        return redisTemplate.opsForSet().members(ONLINE_USERS_KEY);
    }

    private void broadcastUserStatus(String username, boolean isOnline) {
        String status = isOnline ? "online" : "offline";
        messagingTemplate.convertAndSend("/topic/presence", username + " is " + status);
    }
} 