package com.devign.chattr.integration;

import com.devign.chattr.service.UserPresenceService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.Set;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Tag("integration")
public class RedisIntegrationTest {

    @Autowired
    private UserPresenceService userPresenceService;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Test
    public void testUserPresence() {
        String username = "testuser";

        // Test user connection
        userPresenceService.userConnected(username);
        assertTrue(userPresenceService.isUserOnline(username));
        Set<String> onlineUsers = userPresenceService.getOnlineUsers();
        assertTrue(onlineUsers.contains(username));

        // Test user disconnection
        userPresenceService.userDisconnected(username);
        assertFalse(userPresenceService.isUserOnline(username));
        onlineUsers = userPresenceService.getOnlineUsers();
        assertFalse(onlineUsers.contains(username));
    }

    @Test
    public void testPresenceTimeout() throws InterruptedException {
        String username = "timeoutuser";
        userPresenceService.userConnected(username);
        assertTrue(userPresenceService.isUserOnline(username));

        // Wait for timeout
        Thread.sleep(TimeUnit.SECONDS.toMillis(31));
        assertFalse(userPresenceService.isUserOnline(username));
    }
} 
