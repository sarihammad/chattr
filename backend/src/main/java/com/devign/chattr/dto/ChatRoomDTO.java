package com.devign.chattr.dto;

import com.devign.chattr.model.ChatRoom;
import com.devign.chattr.model.MatchmakingMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomDTO {
    
    private String roomId;
    private UserProfileDTO otherUser;
    private MatchmakingMode mode;
    private String lastMessagePreview;
    private Long unreadCount;
    private LocalDateTime lastMessageAt;
    private Boolean isActive;
}


