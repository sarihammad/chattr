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
public class IntroductionDTO {
    private Long candidateId;
    private UserProfileDTO candidate;
    private Double score;
    private List<String> signals; // Top 3 shared signals
    private List<String> reasons; // Human-readable match reasons
    private String status; // PENDING, SHOWN, ACCEPTED, PASSED
}

