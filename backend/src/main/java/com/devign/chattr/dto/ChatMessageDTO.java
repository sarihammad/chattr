package com.devign.chattr.dto;

import com.devign.chattr.model.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDTO {
    
    private Long id;
    private String roomId;
    private String sender;
    private String receiver;
    private String content;
    private ChatMessage.MessageType type;
    private String mediaUrl;
    private LocalDateTime timestamp;
    private Boolean isRead;
    private Boolean isDelivered;
    private Boolean isEdited;
    private LocalDateTime editedAt;
}


