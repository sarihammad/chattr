package com.devign.chattr.repository;

import com.devign.chattr.model.MatchCandidate;
import com.devign.chattr.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MatchCandidateRepository extends JpaRepository<MatchCandidate, Long> {
    List<MatchCandidate> findByUserAndMatchDateAndStatus(User user, LocalDate date, MatchCandidate.CandidateStatus status);
    List<MatchCandidate> findByUserAndMatchDateOrderByScoreDesc(User user, LocalDate date);
    Optional<MatchCandidate> findByUserAndCandidateUserAndMatchDate(User user, User candidateUser, LocalDate date);
    boolean existsByUserAndMatchDate(User user, LocalDate date);
    long countByUserAndMatchDate(User user, LocalDate date);
}

