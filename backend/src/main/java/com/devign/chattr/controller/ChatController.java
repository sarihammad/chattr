package com.devign.chattr.controller;

import com.devign.chattr.aspect.Ratelimited;
import com.devign.chattr.dto.*;
import com.devign.chattr.mapper.ChatMapper;
import com.devign.chattr.model.ConversationOpener;
import com.devign.chattr.repository.ConversationOpenerRepository;
import com.devign.chattr.repository.ChatRoomRepository;
import com.devign.chattr.repository.ChatMessageRepository;
import com.devign.chattr.repository.UserRepository;
import com.devign.chattr.service.ChatService;
import com.devign.chattr.service.UserPresenceService;
import com.devign.chattr.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserPresenceService userPresenceService;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ConversationOpenerRepository openerRepository;
    private final UserRepository userRepository;
    private final ChatMapper chatMapper;
    private final AuthUtil authUtil;

    @GetMapping("/room/{roomId}/messages")
    public ResponseEntity<Page<ChatMessageDTO>> getChatHistory(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size,
        @RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        Page<com.devign.chattr.model.ChatMessage> messages = chatService.getChatHistory(roomId, username, PageRequest.of(page, size));
        return ResponseEntity.ok(chatMapper.toDTOPage(messages));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomDTO>> getChatRooms(@RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);

        Page<com.devign.chattr.model.ChatRoom> rooms = chatRoomRepository.findUserChatRooms(username, PageRequest.of(0, 100));
        List<ChatRoomDTO> roomDTOs = rooms.getContent().stream()
                .map(room -> {
                    String otherUsername = room.getUser1().getUsername().equals(username)
                            ? room.getUser2().getUsername()
                            : room.getUser1().getUsername();
                    com.devign.chattr.model.User otherUserEntity = userRepository.findByUsername(otherUsername).orElse(null);
                    UserProfileDTO otherUser = chatMapper.toUserProfileDTO(otherUserEntity);

                    // Get last message
                    com.devign.chattr.model.ChatMessage lastMessage = chatMessageRepository.findByChatRoomId(room.getRoomId(), PageRequest.of(0, 1))
                            .getContent().stream().findFirst().orElse(null);
                    String lastMessagePreview = lastMessage != null ? lastMessage.getContent() : null;

                    // Get unread count
                    Long unreadCount = chatMessageRepository.findByChatRoomId(room.getRoomId(), Pageable.unpaged())
                            .getContent().stream()
                            .filter(msg -> msg.getReceiver().equals(username) && !msg.getIsRead())
                            .count();

                    return chatMapper.toChatRoomDTO(room, username, otherUser, lastMessagePreview, unreadCount);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(roomDTOs);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<UnreadCountResponse> getUnreadMessageCount(@RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);

        Page<com.devign.chattr.model.ChatRoom> rooms = chatRoomRepository.findUserChatRooms(username, Pageable.unpaged());
        Map<String, Long> perRoom = new HashMap<>();
        long totalUnread = 0;

        for (com.devign.chattr.model.ChatRoom room : rooms.getContent()) {
            Long unreadCount = chatMessageRepository.findByChatRoomId(room.getRoomId(), Pageable.unpaged())
                    .getContent().stream()
                    .filter(msg -> msg.getReceiver().equals(username) && !msg.getIsRead())
                    .count();
            perRoom.put(room.getRoomId(), unreadCount);
            totalUnread += unreadCount;
        }

        UnreadCountResponse response = UnreadCountResponse.builder()
                .totalUnread(totalUnread)
                .perRoom(perRoom)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/room/{roomId}/openers")
    public ResponseEntity<List<ConversationOpenerDTO>> getConversationOpeners(@PathVariable String roomId) {
        List<ConversationOpener> openers = openerRepository.findByRoom_RoomIdOrderByCreatedAtDesc(roomId);
        List<ConversationOpenerDTO> openerDTOs = openers.stream()
                .map(opener -> ConversationOpenerDTO.builder()
                        .id(opener.getId())
                        .text(opener.getText())
                        .createdAt(opener.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(openerDTOs);
    }

    @GetMapping("/online")
    public ResponseEntity<Set<String>> getOnlineUsers() {
        Set<String> onlineUsers = userPresenceService.getOnlineUsers();
        return ResponseEntity.ok(onlineUsers);
    }

    @GetMapping("/status/{username}")
    public ResponseEntity<Map<String, Boolean>> getUserStatus(@PathVariable String username) {
        boolean isOnline = userPresenceService.isUserOnline(username);
        return ResponseEntity.ok(Map.of("online", isOnline));
    }

    @Ratelimited
    @GetMapping("/messages/search")
    public ResponseEntity<Page<ChatMessageDTO>> searchMessages(
            @RequestParam(required = false) String content,
            @RequestParam(required = false) String sender,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size,
        @RequestHeader("Authorization") String token) {
        authUtil.getUsernameFromToken(token); // Validate auth
        java.time.LocalDateTime start = startDate != null ? java.time.LocalDateTime.parse(startDate) : null;
        java.time.LocalDateTime end = endDate != null ? java.time.LocalDateTime.parse(endDate) : null;
        Page<com.devign.chattr.model.ChatMessage> messages = chatService.searchMessages(content, sender, start, end, PageRequest.of(page, size));
        return ResponseEntity.ok(chatMapper.toDTOPage(messages));
    }

    @PutMapping("/messages/{messageId}")
    public ResponseEntity<ChatMessageDTO> editMessage(
            @PathVariable Long messageId,
            @RequestParam String newContent,
            @RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        com.devign.chattr.model.ChatMessage updated = chatService.editMessage(messageId, username, newContent);
        return ResponseEntity.ok(chatMapper.toDTO(updated));
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Map<String, String>> deleteMessage(
            @PathVariable Long messageId,
            @RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        chatService.deleteMessage(messageId, username);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Message deleted"));
    }
} 
