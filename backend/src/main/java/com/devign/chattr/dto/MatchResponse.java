package com.devign.chattr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchResponse {
    
    private Boolean matchFound;
    private String roomId;
    private UserProfileDTO otherUser;
    private List<String> sharedInterests;
    private Double score;
}


