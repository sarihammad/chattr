package com.devign.chattr.service;

import com.devign.chattr.model.Block;
import com.devign.chattr.model.User;
import com.devign.chattr.repository.BlockRepository;
import com.devign.chattr.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@Slf4j
public class BlockService {

    private static final String BLOCKED_PREFIX = "user:blocked:";

    @Autowired
    private BlockRepository blockRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Transactional
    public void blockUser(String blockerUsername, String blockedUsername) {
        User blocker = userRepository.findByUsername(blockerUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + blockerUsername));
        User blocked = userRepository.findByUsername(blockedUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + blockedUsername));

        if (blockRepository.existsByBlockerAndBlocked(blocker, blocked)) {
            return; // Already blocked
        }

        Block block = Block.builder()
                .blocker(blocker)
                .blocked(blocked)
                .build();
        blockRepository.save(block);

        // Cache in Redis
        String key = BLOCKED_PREFIX + blockerUsername;
        redisTemplate.opsForSet().add(key, blockedUsername);
    }

    @Transactional
    public void unblockUser(String blockerUsername, String blockedUsername) {
        User blocker = userRepository.findByUsername(blockerUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + blockerUsername));
        User blocked = userRepository.findByUsername(blockedUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + blockedUsername));

        blockRepository.findByBlockerAndBlocked(blocker, blocked)
                .ifPresent(blockRepository::delete);

        // Remove from Redis
        String key = BLOCKED_PREFIX + blockerUsername;
        redisTemplate.opsForSet().remove(key, blockedUsername);
    }

    public boolean isBlocked(String blockerUsername, String blockedUsername) {
        Set<String> blockedSet = redisTemplate.opsForSet().members(BLOCKED_PREFIX + blockerUsername);
        if (blockedSet != null && blockedSet.contains(blockedUsername)) {
            return true;
        }
        // Fallback to DB if not in cache
        User blocker = userRepository.findByUsername(blockerUsername).orElse(null);
        User blocked = userRepository.findByUsername(blockedUsername).orElse(null);
        if (blocker != null && blocked != null) {
            return blockRepository.existsByBlockerAndBlocked(blocker, blocked);
        }
        return false;
    }
}


