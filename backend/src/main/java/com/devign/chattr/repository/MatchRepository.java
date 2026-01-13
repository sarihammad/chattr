package com.devign.chattr.repository;

import com.devign.chattr.model.Match;
import com.devign.chattr.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByUserAAndIsActiveTrue(User user);
    List<Match> findByUserBAndIsActiveTrue(User user);
    Optional<Match> findByUserAAndUserB(User userA, User userB);
    Optional<Match> findByUserBAndUserA(User userB, User userA); // Check reverse direction
    
    @Query("SELECT m FROM Match m WHERE (m.userA = :user OR m.userB = :user) AND m.isActive = true")
    List<Match> findActiveMatchesByUser(User user);
}

