package com.devign.chattr.util;

import java.util.Date;

import javax.crypto.SecretKey;

import java.util.concurrent.ConcurrentHashMap;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

public class JwtUtil {
    private static final long EXPIRATION_TIME = 86400000;
    private static final SecretKey SECRET = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private static final ConcurrentHashMap<String, Boolean> invalidatedTokens = new ConcurrentHashMap<>();

    public static String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET)
                .compact();
    }

    public static String validateToken(String token) {
        try {
            if (invalidatedTokens.containsKey(token)) {
                return null; // Token has been invalidated
            }
            return Jwts.parserBuilder()
                    .setSigningKey(SECRET)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (JwtException e) {
            return null;
        }
    }

    public static void invalidateToken(String token) {
        invalidatedTokens.put(token, true);
    }

    public static boolean isTokenInvalidated(String token) {
        return invalidatedTokens.containsKey(token);
    }
}
