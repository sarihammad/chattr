package com.devign.chattr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiGenerateOpenersRequest {
    
    private Map<String, Object> user;
    private Map<String, Object> match;
    private List<String> shared_interests;
}


