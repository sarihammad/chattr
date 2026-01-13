package com.devign.chattr.controller;

import com.devign.chattr.aspect.Ratelimited;
import com.devign.chattr.dto.*;
import com.devign.chattr.exception.BadRequestException;
import com.devign.chattr.service.MatchmakingService;
import com.devign.chattr.util.AuthUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/matchmaking")
@RequiredArgsConstructor
public class MatchmakingController {

    private final MatchmakingService matchmakingService;
    private final AuthUtil authUtil;

    @PostMapping("/preferences")
    public ResponseEntity<Map<String, String>> updatePreferences(
            @Valid @RequestBody MatchmakingPreferencesDTO dto,
            @RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        matchmakingService.updatePreferences(username, dto);
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @Ratelimited
    @PostMapping("/start")
    public ResponseEntity<MatchResponse> startMatchmaking(@RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        MatchResponse response = matchmakingService.startMatchmaking(username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<MatchmakingStatusResponse> getStatus(@RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        MatchmakingStatusResponse status = matchmakingService.getStatus(username);
        return ResponseEntity.ok(status);
    }

    @Ratelimited
    @PostMapping("/stop")
    public ResponseEntity<Map<String, String>> stopMatchmaking(@RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        matchmakingService.stopMatchmaking(username);
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @Ratelimited
    @PostMapping("/skip")
    public ResponseEntity<Map<String, String>> skipMatch(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> request) {
        String username = authUtil.getUsernameFromToken(token);
        String roomId = request.get("roomId");
        if (roomId == null || roomId.isEmpty()) {
            throw new BadRequestException("roomId is required");
        }
        matchmakingService.skipMatch(username, roomId);
        return ResponseEntity.ok(Map.of("status", "success"));
    }
}
