package com.namhatta.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class UsernameValidator implements ConstraintValidator<ValidUsername, String> {
    
    private static final String USERNAME_PATTERN = "^[a-zA-Z0-9_]{3,50}$";
    
    @Override
    public void initialize(ValidUsername constraintAnnotation) {
    }
    
    @Override
    public boolean isValid(String username, ConstraintValidatorContext context) {
        if (username == null) {
            return false;
        }
        
        return username.matches(USERNAME_PATTERN);
    }
}
