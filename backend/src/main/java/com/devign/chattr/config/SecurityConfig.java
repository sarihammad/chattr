package com.devign.chattr.config;

import com.devign.chattr.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import java.util.Collections;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/v1/auth/**", "/api/v1/users/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore((request, response, chain) -> {
                HttpServletRequest httpRequest = (HttpServletRequest) request;
                String header = httpRequest.getHeader("Authorization");
                if (header != null && header.startsWith("Bearer ")) {
                    String token = header.substring(7);
                    String username = JwtUtil.validateToken(token);
                    if (username != null) {
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());
                        httpRequest.setAttribute("username", username);
                        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
                chain.doFilter(request, response);
            }, BasicAuthenticationFilter.class);
            // .addFilterBefore(new RateLimiterFilter(), org.springframework.security.web.context.SecurityContextHolderFilter.class);

        return http.build();
    }
}