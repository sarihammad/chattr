package com.devign.chattr.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "match_candidates", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "candidate_user_id", "match_date"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchCandidate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "candidate_user_id", nullable = false)
    private User candidateUser;

    @Column(nullable = false)
    private Double score;

    @Column(columnDefinition = "TEXT")
    private String reasonsJson; // JSON with top 3 reasons, shared signals

    @Column(nullable = false)
    private LocalDate matchDate; // Date this candidate was generated for

    @Column
    private LocalDateTime surfacedAt; // When user viewed this candidate

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CandidateStatus status = CandidateStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public enum CandidateStatus {
        PENDING,    // Generated but not shown
        SHOWN,      // Shown to user
        ACCEPTED,   // User accepted
        PASSED      // User passed
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (matchDate == null) {
            matchDate = LocalDate.now();
        }
    }
}

