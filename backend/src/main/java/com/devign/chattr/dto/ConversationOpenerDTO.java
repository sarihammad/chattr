package com.devign.chattr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationOpenerDTO {
    
    private Long id;
    private String text;
    private LocalDateTime createdAt;
}


