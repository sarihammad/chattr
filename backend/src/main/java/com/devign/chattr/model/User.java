package com.devign.chattr.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String gender;

    @Column
    private String orientation; // "STRAIGHT", "GAY", "BISEXUAL", "PANSEXUAL", etc.

    @Column
    private String seeking; // "MEN", "WOMEN", "EVERYONE"

    @Column
    private String bio;

    @Column
    private Integer age;

    @Column
    private String country;

    @Column
    private String city;

    @Column
    private String avatarUrl;

    @Column(nullable = false)
    private Boolean isOnline;

    @Column(nullable = false)
    private Boolean matchingPaused = false;

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

    public static class UserBuilder {
        public UserBuilder passwordHash(String passwordHash) {
            this.password = passwordHash;
            return this;
        }
    }
}
