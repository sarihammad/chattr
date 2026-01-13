package com.devign.chattr.service;

import com.devign.chattr.exception.BlockedUserException;
import com.devign.chattr.exception.NotFoundException;
import com.devign.chattr.exception.UnauthorizedException;
import com.devign.chattr.model.ChatMessage;
import com.devign.chattr.model.ChatRoom;
import com.devign.chattr.model.User;
import com.devign.chattr.repository.ChatMessageRepository;
import com.devign.chattr.repository.ChatRoomRepository;
import com.devign.chattr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class ChatService {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserPresenceService userPresenceService;

    @Autowired
    private BlockService blockService;

    @Transactional
    public ChatRoom getOrCreateChatRoom(String user1Username, String user2Username) {
        // Check if either user blocked the other
        if (blockService.isBlocked(user1Username, user2Username) || 
            blockService.isBlocked(user2Username, user1Username)) {
            throw new BlockedUserException("Cannot create chat room: One user has blocked the other");
        }

        Optional<ChatRoom> existingRoom = chatRoomRepository.findChatRoomByUsers(user1Username, user2Username);
        
        if (existingRoom.isPresent()) {
            return existingRoom.get();
        }

        User user1 = userRepository.findByUsername(user1Username)
                .orElseThrow(() -> new NotFoundException("User not found: " + user1Username));
        User user2 = userRepository.findByUsername(user2Username)
                .orElseThrow(() -> new NotFoundException("User not found: " + user2Username));

        ChatRoom newRoom = ChatRoom.builder()
                .roomId(UUID.randomUUID().toString())
                .user1(user1)
                .user2(user2)
                .build();

        return chatRoomRepository.save(newRoom);
    }

    @Transactional
    public ChatMessage sendMessage(String roomId, String sender, String content, ChatMessage.MessageType type, String mediaUrl) {
        ChatRoom chatRoom = chatRoomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new NotFoundException("Chat room not found: " + roomId));

        // Verify sender is part of this chat room
        if (!chatRoom.getUser1().getUsername().equals(sender) &&
            !chatRoom.getUser2().getUsername().equals(sender)) {
            throw new UnauthorizedException("You are not part of this chat room");
        }

        String receiver = chatRoom.getUser1().getUsername().equals(sender) 
                ? chatRoom.getUser2().getUsername() 
                : chatRoom.getUser1().getUsername();

        // Check if either user blocked the other
        if (blockService.isBlocked(sender, receiver) || blockService.isBlocked(receiver, sender)) {
            throw new BlockedUserException("Cannot send message: One user has blocked the other");
        }

        ChatMessage message = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .receiver(receiver)
                .content(content)
                .type(type)
                .mediaUrl(mediaUrl)
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);
        
        chatRoom.setLastMessageAt(savedMessage.getTimestamp());
        chatRoomRepository.save(chatRoom);

        // Broadcast via WebSocket
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, savedMessage);

        return savedMessage;
    }

    public Page<ChatMessage> getChatHistory(String roomId, String username, Pageable pageable) {
        ChatRoom room = chatRoomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new NotFoundException("Chat room not found: " + roomId));

        // Verify user is part of this chat room
        if (!room.getUser1().getUsername().equals(username) &&
            !room.getUser2().getUsername().equals(username)) {
            throw new UnauthorizedException("You are not part of this chat room");
        }

        return chatMessageRepository.findByChatRoomId(roomId, pageable);
    }

    @Transactional
    public void markMessagesAsRead(String roomId, String username) {
        ChatRoom room = chatRoomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new NotFoundException("Chat room not found: " + roomId));

        // Verify user is part of this chat room
        if (!room.getUser1().getUsername().equals(username) &&
            !room.getUser2().getUsername().equals(username)) {
            throw new UnauthorizedException("You are not part of this chat room");
        }

        Page<ChatMessage> messages = chatMessageRepository.findByChatRoomId(roomId, Pageable.unpaged());
        messages.getContent()
                .stream()
                .filter(message -> message.getReceiver().equals(username) && !message.getIsRead())
                .forEach(message -> {
                    message.setIsRead(true);
                    chatMessageRepository.save(message);
                });
    }

    public Long getUnreadMessageCount(String username) {
        return chatMessageRepository.countUnreadMessages(username);
    }

    public Page<ChatMessage> searchMessages(String content, String sender, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate, Pageable pageable) {
        return chatMessageRepository.searchMessages(content, sender, startDate, endDate, pageable);
    }

    public ChatMessage editMessage(Long messageId, String username, String newContent) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new NotFoundException("Message not found: " + messageId));
        if (!message.getSender().equals(username)) {
            throw new com.devign.chattr.exception.UnauthorizedException("You are not authorized to edit this message");
        }
        if (message.getIsDeleted()) {
            throw new com.devign.chattr.exception.BadRequestException("Cannot edit deleted message");
        }
        message.setContent(newContent);
        message.setIsEdited(true);
        message.setEditedAt(java.time.LocalDateTime.now());
        return chatMessageRepository.save(message);
    }

    public void deleteMessage(Long messageId, String username) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new NotFoundException("Message not found: " + messageId));
        if (!message.getSender().equals(username)) {
            throw new com.devign.chattr.exception.UnauthorizedException("You are not authorized to delete this message");
        }
        message.setIsDeleted(true);
        chatMessageRepository.save(message);
    }
} 