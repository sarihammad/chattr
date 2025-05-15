package com.devign.chattr.controller;

import com.devign.chattr.dto.UserRequest;
import com.devign.chattr.repository.UserRepository;
import com.devign.chattr.util.JwtUtil;
import com.devign.chattr.aspect.Ratelimited;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Ratelimited
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody UserRequest userRequest) {
        return userRepository.findByUsername(userRequest.getUsername())
                .filter(user -> passwordEncoder.matches(userRequest.getPassword(), user.getPassword()))
                .map(user -> ResponseEntity.ok(JwtUtil.generateToken(user.getUsername())))
                .orElse(ResponseEntity.status(401).body("Invalid Credentials"));
    }
}