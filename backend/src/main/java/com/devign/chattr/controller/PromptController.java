package com.devign.chattr.controller;

import com.devign.chattr.model.Prompt;
import com.devign.chattr.model.User;
import com.devign.chattr.repository.PromptRepository;
import com.devign.chattr.repository.UserRepository;
import com.devign.chattr.util.AuthUtil;
import com.devign.chattr.exception.NotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/prompts")
@RequiredArgsConstructor
public class PromptController {

    private final PromptRepository promptRepository;
    private final UserRepository userRepository;
    private final AuthUtil authUtil;

    /**
     * Get user's prompts.
     */
    @GetMapping
    public ResponseEntity<List<PromptResponse>> getPrompts(@RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));

        List<Prompt> prompts = promptRepository.findByUser(user);
        List<PromptResponse> responses = prompts.stream()
                .map(p -> {
                    PromptResponse response = new PromptResponse();
                    response.setPromptKey(p.getPromptKey());
                    response.setText(p.getText());
                    return response;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    /**
     * Update user's prompts (create or update).
     */
    @PutMapping
    public ResponseEntity<Map<String, String>> updatePrompts(
            @Valid @RequestBody PromptUpdateRequest request,
            @RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));

        // Update or create each prompt
        request.getPrompts().forEach(promptReq -> {
            Prompt prompt = promptRepository.findByUserAndPromptKey(user, promptReq.getPromptKey())
                    .orElse(Prompt.builder()
                            .user(user)
                            .promptKey(promptReq.getPromptKey())
                            .build());

            prompt.setText(promptReq.getText());
            promptRepository.save(prompt);
        });

        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @Data
    public static class PromptResponse {
        private String promptKey;
        private String text;
    }

    @Data
    public static class PromptUpdateRequest {
        @Valid
        private List<PromptItem> prompts;
    }

    @Data
    public static class PromptItem {
        @NotBlank
        private String promptKey;
        @NotBlank
        private String text;
    }
}

