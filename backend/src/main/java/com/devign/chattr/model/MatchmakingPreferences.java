package com.devign.chattr.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "matchmaking_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchmakingPreferences {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchmakingMode mode;

    @Column
    private Integer age;

    @Column
    private String country;

    @Column
    private String city;

    @Column
    private Integer minAge;

    @Column
    private Integer maxAge;

    @Column(columnDefinition = "TEXT")
    private String allowedCountries; // JSON array as string

    @Column(columnDefinition = "TEXT")
    private String interests; // JSON array as string

    @Column(nullable = false)
    private Boolean openToAny = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


