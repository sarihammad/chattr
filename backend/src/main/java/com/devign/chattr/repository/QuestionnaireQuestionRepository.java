package com.devign.chattr.repository;

import com.devign.chattr.model.QuestionnaireQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionnaireQuestionRepository extends JpaRepository<QuestionnaireQuestion, Long> {
    List<QuestionnaireQuestion> findAllByOrderByDisplayOrderAsc();
}

