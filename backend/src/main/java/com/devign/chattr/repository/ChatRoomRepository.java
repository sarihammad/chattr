package com.devign.chattr.repository;

import com.devign.chattr.model.ChatRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    Optional<ChatRoom> findByRoomId(String roomId);
    
    @Query("SELECT cr FROM ChatRoom cr WHERE (cr.user1.username = :username OR cr.user2.username = :username) ORDER BY cr.lastMessageAt DESC")
    Page<ChatRoom> findUserChatRooms(@Param("username") String username, Pageable pageable);
    
    @Query("SELECT cr FROM ChatRoom cr WHERE (cr.user1.username = :user1 AND cr.user2.username = :user2) OR (cr.user1.username = :user2 AND cr.user2.username = :user1)")
    Optional<ChatRoom> findChatRoomByUsers(@Param("user1") String user1, @Param("user2") String user2);
} 