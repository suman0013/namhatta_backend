package com.namhatta.exception;

public class InsufficientPermissionException extends RuntimeException {
    
    public InsufficientPermissionException(String message) {
        super(message);
    }
    
    public InsufficientPermissionException(String message, Throwable cause) {
        super(message, cause);
    }
}
