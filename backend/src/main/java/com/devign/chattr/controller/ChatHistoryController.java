package com.devign.chattr.controller;

import com.devign.chattr.dto.ChatMessageDTO;
import com.devign.chattr.mapper.ChatMapper;
import com.devign.chattr.repository.ChatMessageRepository;
import com.devign.chattr.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Legacy endpoint for chat history by sender/receiver.
 * Prefer using /api/v1/chat/room/{roomId}/messages instead.
 */
@RestController
@RequestMapping("api/v1/chat")
@RequiredArgsConstructor
public class ChatHistoryController {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatMapper chatMapper;
    private final AuthUtil authUtil;

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(
            @RequestParam String sender,
            @RequestParam String receiver,
            @RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        // Verify requester is either sender or receiver
        if (!username.equals(sender) && !username.equals(receiver)) {
            throw new com.devign.chattr.exception.UnauthorizedException("You can only view your own conversations");
        }
        
        List<com.devign.chattr.model.ChatMessage> history = chatMessageRepository.findBySenderAndReceiver(sender, receiver);
        List<ChatMessageDTO> historyDTOs = history.stream()
                .map(chatMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(historyDTOs);
    }
}
