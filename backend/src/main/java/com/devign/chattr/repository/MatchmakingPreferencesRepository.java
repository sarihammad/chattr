package com.devign.chattr.repository;

import com.devign.chattr.model.MatchmakingPreferences;
import com.devign.chattr.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MatchmakingPreferencesRepository extends JpaRepository<MatchmakingPreferences, Long> {
    
    Optional<MatchmakingPreferences> findByUser(User user);
    
    Optional<MatchmakingPreferences> findByUser_Username(String username);
}


