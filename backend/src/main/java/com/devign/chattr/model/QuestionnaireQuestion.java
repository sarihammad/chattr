package com.devign.chattr.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "questionnaire_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionnaireQuestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(nullable = false)
    private String type; // "MULTIPLE_CHOICE", "SCALE", "TEXT"

    @Column(columnDefinition = "TEXT")
    private String options; // JSON array for multiple choice options

    @Column(nullable = false)
    private Double weight = 1.0; // Weight for scoring

    @Column(nullable = false)
    private Integer displayOrder;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

