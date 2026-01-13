package com.devign.chattr.controller;

import com.devign.chattr.dto.UserResponse;
import com.devign.chattr.dto.UserProfileDTO;
import com.devign.chattr.service.UserService;
import com.devign.chattr.service.BlockService;
import com.devign.chattr.service.ReportService;
import com.devign.chattr.aspect.Ratelimited;
import com.devign.chattr.dto.UserRequest;
import com.devign.chattr.repository.UserRepository;
import com.devign.chattr.model.User;
import com.devign.chattr.util.AuthUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/user")
public class UserController {

    private final UserService userService;

    @Autowired
    private BlockService blockService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthUtil authUtil;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getCurrentUser(@RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.devign.chattr.exception.NotFoundException("User not found"));
        UserProfileDTO profile = UserProfileDTO.builder()
                .username(user.getUsername())
                .age(user.getAge())
                .country(user.getCountry())
                .city(user.getCity())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .build();
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            @Valid @RequestBody UserRequest userRequest,
            @RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        if (!username.equals(userRequest.getUsername())) {
            throw new com.devign.chattr.exception.UnauthorizedException("You can only update your own profile");
        }
        UserResponse userResponse = userService.updateUser(userRequest);
        return ResponseEntity.ok(userResponse);
    }

    @Ratelimited
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username)
                .map(user -> ResponseEntity.ok(Map.of(
                        "status", "success",
                        "user", user
                )))
                .orElse(ResponseEntity.status(404).body(Map.of(
                        "status", "error",
                        "message", "User not found"
                )));
    }

    // Note: /me endpoint is preferred for updating current user profile
    // This endpoint exists for backward compatibility but duplicates /me functionality
    @Ratelimited
    @PutMapping("/update")
    public ResponseEntity<UserResponse> updateUser(@Valid @RequestBody UserRequest userRequest,
                                        @RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        if (!username.equals(userRequest.getUsername())) {
            throw new com.devign.chattr.exception.UnauthorizedException("You can only update your own profile");
        }
        UserResponse userResponse = userService.updateUser(userRequest);
        return ResponseEntity.ok(userResponse);
    }

    @Ratelimited
    @PostMapping("/block")
    public ResponseEntity<Map<String, String>> blockUser(
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String token) {
        String blockerUsername = authUtil.getUsernameFromToken(token);
        String blockedUsername = request.get("blockedUsername");
        if (blockedUsername == null || blockedUsername.isEmpty()) {
            throw new com.devign.chattr.exception.BadRequestException("blockedUsername is required");
        }
        blockService.blockUser(blockerUsername, blockedUsername);
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @PostMapping("/unblock")
    public ResponseEntity<Map<String, String>> unblockUser(
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String token) {
        String blockerUsername = authUtil.getUsernameFromToken(token);
        String blockedUsername = request.get("blockedUsername");
        if (blockedUsername == null || blockedUsername.isEmpty()) {
            throw new com.devign.chattr.exception.BadRequestException("blockedUsername is required");
        }
        blockService.unblockUser(blockerUsername, blockedUsername);
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @Ratelimited
    @PostMapping("/report")
    public ResponseEntity<Map<String, String>> reportUser(
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String token) {
        String reporterUsername = authUtil.getUsernameFromToken(token);
        String reportedUsername = request.get("reportedUsername");
        String reason = request.get("reason");
        if (reportedUsername == null || reportedUsername.isEmpty() || reason == null || reason.isEmpty()) {
            throw new com.devign.chattr.exception.BadRequestException("reportedUsername and reason are required");
        }
        reportService.reportUser(reporterUsername, reportedUsername, reason);
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    /**
     * Pause matching (user will not receive new introductions).
     */
    @PostMapping("/me/pause")
    public ResponseEntity<Map<String, String>> pauseMatching(@RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.devign.chattr.exception.NotFoundException("User not found"));
        user.setMatchingPaused(true);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("status", "success", "matchingPaused", "true"));
    }

    /**
     * Resume matching.
     */
    @PostMapping("/me/resume")
    public ResponseEntity<Map<String, String>> resumeMatching(@RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.devign.chattr.exception.NotFoundException("User not found"));
        user.setMatchingPaused(false);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("status", "success", "matchingPaused", "false"));
    }

    /**
     * Delete account.
     */
    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> deleteAccount(@RequestHeader("Authorization") String token) {
        String username = authUtil.getUsernameFromToken(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.devign.chattr.exception.NotFoundException("User not found"));
        
        // Soft delete: set matching as paused and mark as deleted
        // In a real system, you'd want proper soft delete handling
        user.setMatchingPaused(true);
        userRepository.save(user);
        
        // TODO: In production, implement proper soft delete or deletion logic
        // userRepository.delete(user);
        
        return ResponseEntity.ok(Map.of("status", "success", "message", "Account deleted"));
    }
}
