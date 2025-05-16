package com.devign.chattr.controller;

import com.devign.chattr.service.MatchmakingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/match")
public class MatchmakingController {

    private final MatchmakingService matchmakingService;

    public MatchmakingController(MatchmakingService matchmakingService) {
        this.matchmakingService = matchmakingService;
    }

    @PostMapping("/start")
    public ResponseEntity<String> startMatchmaking(
            @RequestParam String username,
            @RequestParam String genderPreference,
            @RequestParam String purposePreference) {
        
        matchmakingService.startMatchmaking(username, genderPreference, purposePreference);
        return ResponseEntity.ok("Matchmaking started for " + username);
    }

    @PostMapping("/cancel")
    public ResponseEntity<String> cancelMatchmaking(@RequestParam String username) {
        matchmakingService.cancelMatchmaking(username);
        return ResponseEntity.ok("Matchmaking canceled for " + username);
    }

    @GetMapping("/status")
    public ResponseEntity<String> checkMatchmakingStatus(@RequestParam String username) {
        return matchmakingService.findMatch(username)
                .map(match -> ResponseEntity.ok("Matched with " + match))
                .orElse(ResponseEntity.ok("No match found yet. Keep waiting..."));
    }
}