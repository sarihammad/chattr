package com.devign.chattr.controller;

import com.devign.chattr.dto.UserResponse;
import com.devign.chattr.service.UserService;
import com.devign.chattr.aspect.Ratelimited;
import com.devign.chattr.dto.UserRequest;
import com.devign.chattr.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
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

    @Ratelimited
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@Valid @RequestBody UserRequest userRequest,
                                        @RequestHeader("Authorization") String token) {
        String username = JwtUtil.validateToken(token.replace("Bearer ", ""));

        if (username == null || !username.equals(userRequest.getUsername())) {
            return ResponseEntity.status(403).body(Map.of(
                    "status", "error",
                    "message", "Unauthorized"
            ));
        }

        if (userService.isEmailTaken(userRequest.getEmail(), userRequest.getUsername())) {
            return ResponseEntity.status(409).body(Map.of(
                    "status", "error",
                    "message", "Email is already in use"
            ));
        }

        UserResponse userResponse = userService.updateUser(userRequest);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "user", userResponse
        ));
    }
}