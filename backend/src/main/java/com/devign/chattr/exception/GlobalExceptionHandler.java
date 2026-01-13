package com.devign.chattr.exception;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFoundException(NotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        Map<String, Object> response = buildErrorResponse(
                "NOT_FOUND",
                ex.getMessage(),
                HttpStatus.NOT_FOUND
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorizedException(UnauthorizedException ex) {
        log.warn("Unauthorized: {}", ex.getMessage());
        Map<String, Object> response = buildErrorResponse(
                "UNAUTHORIZED",
                ex.getMessage(),
                HttpStatus.UNAUTHORIZED
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequestException(BadRequestException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        Map<String, Object> response = buildErrorResponse(
                "BAD_REQUEST",
                ex.getMessage(),
                HttpStatus.BAD_REQUEST
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(BlockedUserException.class)
    public ResponseEntity<Map<String, Object>> handleBlockedUserException(BlockedUserException ex) {
        log.warn("Blocked user action: {}", ex.getMessage());
        Map<String, Object> response = buildErrorResponse(
                "BLOCKED_USER",
                ex.getMessage(),
                HttpStatus.FORBIDDEN
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(MatchmakingException.class)
    public ResponseEntity<Map<String, Object>> handleMatchmakingException(MatchmakingException ex) {
        log.warn("Matchmaking error: {}", ex.getMessage());
        Map<String, Object> response = buildErrorResponse(
                "MATCHMAKING_ERROR",
                ex.getMessage(),
                HttpStatus.BAD_REQUEST
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        Map<String, Object> response = buildErrorResponse(
                "INVALID_ARGUMENT",
                ex.getMessage(),
                HttpStatus.BAD_REQUEST
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception: {}", ex.getMessage(), ex);
        Map<String, Object> response = buildErrorResponse(
                "RUNTIME_ERROR",
                ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
        log.warn("Validation error: {}", ex.getMessage());
        Map<String, String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fieldError -> fieldError.getDefaultMessage() != null 
                                ? fieldError.getDefaultMessage() 
                                : "Invalid value",
                        (existing, replacement) -> existing
                ));

        Map<String, Object> response = buildErrorResponse(
                "VALIDATION_ERROR",
                "Validation failed",
                HttpStatus.BAD_REQUEST
        );
        response.put("errors", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolationException(ConstraintViolationException ex) {
        log.warn("Constraint violation: {}", ex.getMessage());
        Map<String, Object> response = buildErrorResponse(
                "CONSTRAINT_VIOLATION",
                ex.getMessage(),
                HttpStatus.BAD_REQUEST
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentialsException(BadCredentialsException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        Map<String, Object> response = buildErrorResponse(
                "AUTHENTICATION_FAILED",
                "Invalid credentials",
                HttpStatus.UNAUTHORIZED
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        Map<String, Object> response = buildErrorResponse(
                "ACCESS_DENIED",
                "You don't have permission to access this resource",
                HttpStatus.FORBIDDEN
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(MessageDeliveryException.class)
    public ResponseEntity<Map<String, Object>> handleWebSocketException(MessageDeliveryException ex) {
        log.error("WebSocket delivery error: {}", ex.getMessage(), ex);
        Map<String, Object> response = buildErrorResponse(
                "WEBSOCKET_ERROR",
                "Failed to deliver message",
                HttpStatus.INTERNAL_SERVER_ERROR
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxSizeException(MaxUploadSizeExceededException ex) {
        log.warn("File size exceeded: {}", ex.getMessage());
        Map<String, Object> response = buildErrorResponse(
                "FILE_TOO_LARGE",
                "File size exceeds maximum limit of 10MB",
                HttpStatus.PAYLOAD_TOO_LARGE
        );
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(response);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoHandlerFoundException(NoHandlerFoundException ex) {
        log.warn("Handler not found: {}", ex.getRequestURL());
        Map<String, Object> response = buildErrorResponse(
                "NOT_FOUND",
                "The requested resource was not found",
                HttpStatus.NOT_FOUND
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        Map<String, Object> response = buildErrorResponse(
                "INTERNAL_ERROR",
                "An unexpected error occurred. Please try again later.",
                HttpStatus.INTERNAL_SERVER_ERROR
        );
        // Don't expose internal error details in production
        if (log.isDebugEnabled()) {
            response.put("details", ex.getMessage());
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private Map<String, Object> buildErrorResponse(String code, String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", code);
        response.put("message", message);
        response.put("status", status.value());
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }
} 