package com.devign.chattr.controller;

import com.devign.chattr.model.GroupChat;
import com.devign.chattr.model.GroupMessage;
import com.devign.chattr.model.User;
import com.devign.chattr.repository.GroupChatRepository;
import com.devign.chattr.repository.GroupMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/group")
public class GroupChatController {

    @Autowired
    private GroupChatRepository groupChatRepository;

    @Autowired
    private GroupMessageRepository groupMessageRepository;

    @PostMapping("/create")
    public ResponseEntity<GroupChat> createGroup(@RequestParam String groupName, @RequestParam String createdBy) {
        GroupChat groupChat = GroupChat.builder()
                .groupName(groupName)
                .createdBy(createdBy)
                .build();
        groupChatRepository.save(groupChat);
        return ResponseEntity.ok(groupChat);
    }

    @PostMapping("/join")
    public ResponseEntity<String> joinGroup(@RequestParam String groupName, @RequestParam String username) {
        GroupChat group = groupChatRepository.findByGroupName(groupName);
        if (group == null) {
            return ResponseEntity.status(404).body("Group not found");
        }
        User user = new User(); 
        user.setUsername(username);
        group.getMembers().add(user);
        groupChatRepository.save(group);
        return ResponseEntity.ok("User " + username + " joined " + groupName);
    }

    @PostMapping("/message")
    public ResponseEntity<GroupMessage> sendMessage(@RequestParam String groupId, @RequestParam String sender, @RequestParam String content) {
        GroupMessage message = GroupMessage.builder()
                .groupId(groupId)
                .sender(sender)
                .content(content)
                .build();
        groupMessageRepository.save(message);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/messages")
    public ResponseEntity<List<GroupMessage>> fetchGroupMessages(@RequestParam String groupId) {
        List<GroupMessage> messages = groupMessageRepository.findByGroupId(groupId);
        return ResponseEntity.ok(messages);
    }
}