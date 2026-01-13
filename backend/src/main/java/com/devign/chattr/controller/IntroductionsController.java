package com.devign.chattr.controller;

import com.devign.chattr.aspect.Ratelimited;
import com.devign.chattr.dto.IntroductionDTO;
import com.devign.chattr.service.IntroductionsService;
import com.devign.chattr.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/introductions")
@RequiredArgsConstructor
public class IntroductionsController {

    private final IntroductionsService introductionsService;
    private final AuthUtil authUtil;

    /**
     * Get today's introductions (1-3 candidates).
     */
    @GetMapping
    public ResponseEntity<List<IntroductionDTO>> getIntroductions(@RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        List<IntroductionDTO> introductions = introductionsService.getIntroductions(username);
        return ResponseEntity.ok(introductions);
    }

    /**
     * Accept an introduction.
     * If both users accept, a match is created and chat opens.
     */
    @Ratelimited
    @PostMapping("/{candidateId}/accept")
    public ResponseEntity<Map<String, String>> acceptIntroduction(
            @PathVariable Long candidateId,
            @RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        introductionsService.acceptIntroduction(username, candidateId);
        return ResponseEntity.ok(Map.of("status", "accepted"));
    }

    /**
     * Pass (reject) an introduction.
     */
    @Ratelimited
    @PostMapping("/{candidateId}/pass")
    public ResponseEntity<Map<String, String>> passIntroduction(
            @PathVariable Long candidateId,
            @RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        introductionsService.passIntroduction(username, candidateId);
        return ResponseEntity.ok(Map.of("status", "passed"));
    }

    /**
     * Mark an introduction as shown (when user views it).
     */
    @PostMapping("/{candidateId}/shown")
    public ResponseEntity<Map<String, String>> markAsShown(
            @PathVariable Long candidateId,
            @RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        introductionsService.markIntroductionAsShown(username, candidateId);
        return ResponseEntity.ok(Map.of("status", "shown"));
    }
}

