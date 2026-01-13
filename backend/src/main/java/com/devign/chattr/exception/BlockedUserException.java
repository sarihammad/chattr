package com.devign.chattr.exception;

public class BlockedUserException extends RuntimeException {
    public BlockedUserException(String message) {
        super(message);
    }

    public BlockedUserException(String message, Throwable cause) {
        super(message, cause);
    }
}


