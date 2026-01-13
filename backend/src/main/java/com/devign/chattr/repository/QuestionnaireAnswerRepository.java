package com.devign.chattr.repository;

import com.devign.chattr.model.QuestionnaireAnswer;
import com.devign.chattr.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionnaireAnswerRepository extends JpaRepository<QuestionnaireAnswer, Long> {
    List<QuestionnaireAnswer> findByUser(User user);
    Optional<QuestionnaireAnswer> findByUserAndQuestionId(User user, Long questionId);
    boolean existsByUser(User user);
}

