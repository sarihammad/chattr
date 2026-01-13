package com.devign.chattr.repository;

import com.devign.chattr.model.Block;
import com.devign.chattr.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockRepository extends JpaRepository<Block, Long> {
    
    Optional<Block> findByBlockerAndBlocked(User blocker, User blocked);
    
    boolean existsByBlockerAndBlocked(User blocker, User blocked);
    
    @Query("SELECT b.blocked.username FROM Block b WHERE b.blocker.username = :username")
    List<String> findBlockedUsernamesByBlocker(@Param("username") String username);
    
    @Query("SELECT b.blocker.username FROM Block b WHERE b.blocked.username = :username")
    List<String> findBlockerUsernamesByBlocked(@Param("username") String username);
}


