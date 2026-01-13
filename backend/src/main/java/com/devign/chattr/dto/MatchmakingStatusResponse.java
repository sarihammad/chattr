package com.devign.chattr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchmakingStatusResponse {
    
    private String status; // SEARCHING, MATCHED, IDLE
    private MatchResponse match;
}


