package com.devign.chattr.controller;

import com.devign.chattr.model.QuestionnaireAnswer;
import com.devign.chattr.model.QuestionnaireQuestion;
import com.devign.chattr.model.User;
import com.devign.chattr.repository.QuestionnaireAnswerRepository;
import com.devign.chattr.repository.QuestionnaireQuestionRepository;
import com.devign.chattr.repository.UserRepository;
import com.devign.chattr.util.AuthUtil;
import com.devign.chattr.exception.NotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/questionnaire")
@RequiredArgsConstructor
public class QuestionnaireController {

    private final QuestionnaireQuestionRepository questionRepository;
    private final QuestionnaireAnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final AuthUtil authUtil;

    /**
     * Get all questionnaire questions.
     */
    @GetMapping
    public ResponseEntity<List<QuestionResponse>> getQuestions() {
        List<QuestionnaireQuestion> questions = questionRepository.findAllByOrderByDisplayOrderAsc();
        List<QuestionResponse> responses = questions.stream()
                .map(q -> {
                    QuestionResponse response = new QuestionResponse();
                    response.setId(q.getId());
                    response.setText(q.getText());
                    response.setType(q.getType());
                    response.setWeight(q.getWeight());
                    response.setDisplayOrder(q.getDisplayOrder());
                    
                    // Parse options JSON if present
                    if (q.getOptions() != null && !q.getOptions().isEmpty()) {
                        try {
                            response.setOptions(com.fasterxml.jackson.databind.ObjectMapper.class
                                    .newInstance().readValue(q.getOptions(), List.class));
                        } catch (Exception e) {
                            response.setOptions(List.of());
                        }
                    } else {
                        response.setOptions(List.of());
                    }
                    
                    return response;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }

    /**
     * Submit questionnaire answers.
     */
    @PostMapping("/answers")
    public ResponseEntity<Map<String, String>> submitAnswers(
            @Valid @RequestBody AnswerRequest request,
            @RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));

        // Save or update each answer
        request.getAnswers().forEach(answerReq -> {
            QuestionnaireQuestion question = questionRepository.findById(answerReq.getQuestionId())
                    .orElseThrow(() -> new NotFoundException("Question not found: " + answerReq.getQuestionId()));

            QuestionnaireAnswer answer = answerRepository.findByUserAndQuestionId(user, question.getId())
                    .orElse(QuestionnaireAnswer.builder()
                            .user(user)
                            .question(question)
                            .build());

            answer.setAnswerValue(answerReq.getAnswerValue());
            answerRepository.save(answer);
        });

        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @Data
    public static class QuestionResponse {
        private Long id;
        private String text;
        private String type;
        private List<Object> options;
        private Double weight;
        private Integer displayOrder;
    }

    @Data
    public static class AnswerRequest {
        @NotNull
        private List<AnswerItem> answers;
    }

    @Data
    public static class AnswerItem {
        @NotNull
        private Long questionId;
        @NotNull
        private String answerValue;
    }
}

