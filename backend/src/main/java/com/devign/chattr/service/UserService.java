package com.devign.chattr.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.devign.chattr.dto.UserRequest;
import com.devign.chattr.dto.UserResponse;
import com.devign.chattr.mapper.UserMapper;
import com.devign.chattr.model.User;
import com.devign.chattr.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Autowired
    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }   

    @Transactional
    public UserResponse createUser(UserRequest userRequest) {
        User user = userMapper.toEntity(userRequest); 
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    public Optional<UserResponse> getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(userMapper::toResponse);
    }

    @Transactional
    public UserResponse updateUser(UserRequest userRequest) {
        return userRepository.findByUsername(userRequest.getUsername())
                .map(existingUser -> {
                    existingUser.setEmail(userRequest.getEmail());
                    existingUser.setPassword(userRequest.getPassword());
                    userRepository.save(existingUser);
                    return userMapper.toResponse(existingUser);
                })
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public boolean isEmailTaken(String email, String currentUsername) {
        return userRepository.findByEmail(email)
                .filter(user -> !user.getUsername().equals(currentUsername))
                .isPresent();
    }
}