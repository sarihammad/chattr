package com.devign.chattr.repository;

import com.devign.chattr.model.ConversationOpener;
import com.devign.chattr.model.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationOpenerRepository extends JpaRepository<ConversationOpener, Long> {
    
    List<ConversationOpener> findByRoomOrderByCreatedAtDesc(ChatRoom room);
    
    List<ConversationOpener> findByRoom_RoomIdOrderByCreatedAtDesc(String roomId);
}


