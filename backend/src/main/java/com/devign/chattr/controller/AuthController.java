package com.devign.chattr.controller;

import com.devign.chattr.dto.UserRequest;
import com.devign.chattr.dto.UserResponse;
import com.devign.chattr.repository.UserRepository;
import com.devign.chattr.service.UserService;
import com.devign.chattr.util.JwtUtil;
import com.devign.chattr.aspect.Ratelimited;
import jakarta.validation.Valid;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserService userService;
    
    // In-memory token store for invalidation
    private final Map<String, Boolean> invalidatedTokens = new ConcurrentHashMap<>();

    public AuthController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Register a new user
     */
    @Ratelimited
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRequest userRequest) {
        if (userRepository.findByUsername(userRequest.getUsername()).isPresent()) {
            return ResponseEntity.status(409).body(Map.of(
                "status", "error",
                "message", "Username already exists"
            ));
        }
        if (userRepository.findByEmail(userRequest.getEmail()).isPresent()) {
            return ResponseEntity.status(409).body(Map.of(
                "status", "error",
                "message", "Email already exists"
            ));
        }
        
        UserResponse userResponse = userService.createUser(userRequest);
        String token = JwtUtil.generateToken(userRequest.getUsername());
        
        return ResponseEntity.status(201).body(Map.of(
            "status", "success",
            "user", userResponse,
            "token", token
        ));
    }

    /**
     * Login with username and password
     */
    @Ratelimited
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserRequest userRequest) {
        return userRepository.findByUsername(userRequest.getUsername())
                .filter(user -> passwordEncoder.matches(userRequest.getPassword(), user.getPassword()))
                .map(user -> {
                    String token = JwtUtil.generateToken(user.getUsername());
                    return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "token", token
                    ));
                })
                .orElse(ResponseEntity.status(401).body(Map.of(
                    "status", "error",
                    "message", "Invalid Credentials"
                )));
    }

    /**
     * Logout the user and invalidate the token
     */
    @Ratelimited
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(400).body(Map.of(
                "status", "error",
                "message", "Invalid Token Format"
            ));
        }

        String jwtToken = token.replace("Bearer ", "");
        String username = JwtUtil.validateToken(jwtToken);

        if (username == null) {
            return ResponseEntity.status(403).body(Map.of(
                "status", "error",
                "message", "Invalid Token"
            ));
        }

        // Invalidate the token by adding it to the map
        invalidatedTokens.put(jwtToken, true);

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Logged out successfully"
        ));
    }
}