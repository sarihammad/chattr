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
public class AiBatchScoreResponse {
    
    private List<ScoreResult> results;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ScoreResult {
        private String candidate_username;
        private Double score;
        private List<String> shared_interests;
    }
}


