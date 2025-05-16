package com.devign.chattr.controller;

import com.devign.chattr.model.GroupMessage;
import com.devign.chattr.repository.GroupMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketGroupController {

    @Autowired
    private GroupMessageRepository groupMessageRepository;

    @MessageMapping("/group")
    @SendTo("/topic/group")
    public GroupMessage sendToGroup(GroupMessage message) {
        groupMessageRepository.save(message);
        return message;
    }
}