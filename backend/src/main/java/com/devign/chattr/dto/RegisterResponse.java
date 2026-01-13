package com.devign.chattr.dto;

import com.devign.chattr.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterResponse {
    private String token;
    private User user;
} 