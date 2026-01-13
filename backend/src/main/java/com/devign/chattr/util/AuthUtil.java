package com.devign.chattr.util;

import com.devign.chattr.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthUtil {

    private final JwtUtil jwtUtil;

    /**
     * Extract username from JWT token in Authorization header.
     * Throws UnauthorizedException if token is invalid or missing.
     */
    public String getUsernameFromToken(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing authentication token");
        }
        String username = jwtUtil.validateToken(token.substring(7));
        if (username == null) {
            throw new UnauthorizedException("Invalid authentication token");
        }
        return username;
    }
}

