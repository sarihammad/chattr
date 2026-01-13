package com.devign.chattr.repository;

import com.devign.chattr.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoom.roomId = :roomId AND cm.isDeleted = false ORDER BY cm.timestamp DESC")
    Page<ChatMessage> findByChatRoomId(@Param("roomId") String roomId, Pageable pageable);
    
    List<ChatMessage> findBySenderAndReceiver(String sender, String receiver);
    
    List<ChatMessage> findByReceiver(String receiver);
    
    List<ChatMessage> findByReceiverAndIsRead(String receiver, Boolean isRead);
    
    List<ChatMessage> findByReceiverAndIsDelivered(String receiver, Boolean isDelivered);
    
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.receiver = :username AND cm.isRead = false")
    Long countUnreadMessages(@Param("username") String username);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.isDeleted = false AND (:content IS NULL OR LOWER(cm.content) LIKE LOWER(CONCAT('%', :content, '%'))) AND (:sender IS NULL OR cm.sender = :sender) AND (:startDate IS NULL OR cm.timestamp >= :startDate) AND (:endDate IS NULL OR cm.timestamp <= :endDate)")
    Page<ChatMessage> searchMessages(@Param("content") String content, @Param("sender") String sender, @Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate, Pageable pageable);
}