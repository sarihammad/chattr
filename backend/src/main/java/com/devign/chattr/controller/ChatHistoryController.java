package com.devign.chattr.controller;

import com.devign.chattr.model.ChatMessage;
import com.devign.chattr.repository.ChatMessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/chat")
public class ChatHistoryController {

    private final ChatMessageRepository chatMessageRepository;

    public ChatHistoryController(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @RequestParam String sender,
            @RequestParam String receiver) {
        
        List<ChatMessage> history = chatMessageRepository.findBySenderAndReceiver(sender, receiver);
        return ResponseEntity.ok(history);
    }
}