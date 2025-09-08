package com.devign.chattr.repository;

import com.devign.chattr.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySenderAndReceiver(String sender, String receiver);
    List<ChatMessage> findByReceiver(String receiver);
    List<ChatMessage> findByReceiverAndIsRead(String receiver, Boolean isRead);
    List<ChatMessage> findByReceiverAndIsDelivered(String receiver, Boolean isDelivered);
}