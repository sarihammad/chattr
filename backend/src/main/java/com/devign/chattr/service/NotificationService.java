package com.devign.chattr.service;

import com.devign.chattr.model.ChatMessage;
import com.devign.chattr.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ValueOperations<String, Boolean> valueOperations;

    public List<ChatMessage> getUnreadMessages(String username) {
        return chatMessageRepository.findByReceiverAndIsRead(username, false);
    }

    public void markAsDelivered(String username) {
        List<ChatMessage> messages = chatMessageRepository.findByReceiverAndIsDelivered(username, false);
        for (ChatMessage message : messages) {
            String key = "message:" + message.getId() + ":delivered";
            valueOperations.set(key, true);
            message.setIsDelivered(true);
            chatMessageRepository.save(message);
        }
    }

    public boolean isDelivered(Long messageId) {
        String key = "message:" + messageId + ":delivered";
        Boolean delivered = valueOperations.get(key);
        return delivered != null && delivered;
    }

    public void markAsDelivered(Long messageId) {
        ChatMessage message = chatMessageRepository.findById(messageId).orElse(null);
        if (message != null && !message.getIsDelivered()) {
            String key = "message:" + message.getId() + ":delivered";
            valueOperations.set(key, true);
            message.setIsDelivered(true);
            chatMessageRepository.save(message);
        }
    }

    public void markAsRead(Long messageId) {
        ChatMessage message = chatMessageRepository.findById(messageId).orElse(null);
        if (message != null && !message.getIsRead()) {
            String key = "message:" + message.getId() + ":read";
            valueOperations.set(key, true);
            message.setIsRead(true);
            chatMessageRepository.save(message);
        }
    }

    public boolean isRead(Long messageId) {
        String key = "message:" + messageId + ":read";
        Boolean read = valueOperations.get(key);
        return read != null && read;
    }
}