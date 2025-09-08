package com.devign.chattr.repository;

import com.devign.chattr.model.GroupChat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupChatRepository extends JpaRepository<GroupChat, Long> {
    List<GroupChat> findByMembers_Username(String username);
    GroupChat findByGroupName(String groupName);
}