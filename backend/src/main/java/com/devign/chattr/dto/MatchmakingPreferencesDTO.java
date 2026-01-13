package com.devign.chattr.dto;

import com.devign.chattr.model.MatchmakingMode;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchmakingPreferencesDTO {
    
    @NotNull(message = "Mode is required")
    private MatchmakingMode mode;

    private Integer age;
    private String country;
    private String city;
    private Integer minAge;
    private Integer maxAge;
    private List<String> allowedCountries;
    private List<String> interests;
    
    @Builder.Default
    private Boolean openToAny = false;
}


