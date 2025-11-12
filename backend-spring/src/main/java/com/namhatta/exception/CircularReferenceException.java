package com.namhatta.exception;

public class CircularReferenceException extends ValidationException {
    
    public CircularReferenceException(String message) {
        super(message);
    }
    
    public CircularReferenceException(String message, Throwable cause) {
        super(message, cause);
    }
}
