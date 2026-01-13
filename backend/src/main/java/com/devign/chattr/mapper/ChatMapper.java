package com.devign.chattr.mapper;

import com.devign.chattr.dto.ChatMessageDTO;
import com.devign.chattr.dto.ChatRoomDTO;
import com.devign.chattr.dto.UserProfileDTO;
import com.devign.chattr.model.ChatMessage;
import com.devign.chattr.model.ChatRoom;
import com.devign.chattr.model.User;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ChatMapper {

    public ChatMessageDTO toDTO(ChatMessage message) {
        return ChatMessageDTO.builder()
                .id(message.getId())
                .roomId(message.getChatRoom() != null ? message.getChatRoom().getRoomId() : null)
                .sender(message.getSender())
                .receiver(message.getReceiver())
                .content(message.getContent())
                .type(message.getType())
                .mediaUrl(message.getMediaUrl())
                .timestamp(message.getTimestamp())
                .isRead(message.getIsRead())
                .isDelivered(message.getIsDelivered())
                .isEdited(message.getIsEdited())
                .editedAt(message.getEditedAt())
                .build();
    }

    public Page<ChatMessageDTO> toDTOPage(Page<ChatMessage> messages) {
        return messages.map(this::toDTO);
    }

    public UserProfileDTO toUserProfileDTO(User user) {
        if (user == null) {
            return null;
        }
        return UserProfileDTO.builder()
                .username(user.getUsername())
                .age(user.getAge())
                .country(user.getCountry())
                .city(user.getCity())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    public ChatRoomDTO toChatRoomDTO(ChatRoom room, String currentUsername, 
                                     UserProfileDTO otherUser, 
                                     String lastMessagePreview, 
                                     Long unreadCount) {
        return ChatRoomDTO.builder()
                .roomId(room.getRoomId())
                .otherUser(otherUser)
                .mode(room.getMode())
                .lastMessagePreview(lastMessagePreview)
                .unreadCount(unreadCount)
                .lastMessageAt(room.getLastMessageAt())
                .isActive(room.getIsActive())
                .build();
    }
}


