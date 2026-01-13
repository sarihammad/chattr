package com.devign.chattr.controller;

import com.devign.chattr.dto.LoginRequest;
import com.devign.chattr.dto.LoginResponse;
import com.devign.chattr.dto.RegisterRequest;
import com.devign.chattr.dto.RegisterResponse;
import com.devign.chattr.model.User;
import com.devign.chattr.service.AuthService;
import com.devign.chattr.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);
        String token = authService.generateToken(user);
        return ResponseEntity.ok(new RegisterResponse(token, user));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = authService.authenticate(request.getUsername(), request.getPassword());
        String token = authService.generateToken(user);
        return ResponseEntity.ok(new LoginResponse(token, user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@RequestHeader("Authorization") String token) {
        User user = authService.validateToken(token.replace("Bearer ", ""));
        String newToken = authService.generateToken(user);
        return ResponseEntity.ok(new LoginResponse(newToken, user));
    }
}