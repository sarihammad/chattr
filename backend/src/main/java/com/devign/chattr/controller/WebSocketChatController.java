package com.devign.chattr.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.devign.chattr.model.ChatMessage;
import com.devign.chattr.repository.ChatMessageRepository;

@Controller
public class WebSocketChatController {

    private final ChatMessageRepository chatMessageRepository;

    public WebSocketChatController(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }


    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public ChatMessage send(ChatMessage message) {
        ChatMessage savedMessage = chatMessageRepository.save(message);
        return savedMessage;
    }

    @MessageMapping("/typing")
    @SendTo("/topic/typing")
    public String typing(String username) {
        return username + " is typing...";
    }

    @MessageMapping("/status")
    @SendTo("/topic/status")
    public String status(String username) {
        return username + " is now online";
    }

    @MessageMapping("/seen")
    @SendTo("/topic/seen")
    public String markAsSeen(ChatMessage message) {
        ChatMessage msg = chatMessageRepository.findById(message.getId()).orElseThrow();
        msg.setIsRead(true);
        chatMessageRepository.save(msg);
        return message.getReceiver() + " has seen the message.";
    }
}