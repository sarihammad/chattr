package com.devign.chattr.repository;

import com.devign.chattr.model.Prompt;
import com.devign.chattr.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromptRepository extends JpaRepository<Prompt, Long> {
    List<Prompt> findByUser(User user);
    Optional<Prompt> findByUserAndPromptKey(User user, String promptKey);
}

