package com.namhatta.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class PasswordService {
    
    private final BCryptPasswordEncoder passwordEncoder;
    
    // Password must be at least 8 characters, contain uppercase, lowercase, and number
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$"
    );
    
    public PasswordService() {
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    /**
     * Hash a plain text password using BCrypt
     */
    public String hashPassword(String plainPassword) {
        return passwordEncoder.encode(plainPassword);
    }
    
    /**
     * Verify a plain text password against a hashed password
     */
    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        return passwordEncoder.matches(plainPassword, hashedPassword);
    }
    
    /**
     * Validate password strength
     * @throws IllegalArgumentException if password doesn't meet criteria
     */
    public void validatePasswordStrength(String password) {
        if (password == null || password.isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException(
                "Password must be at least 8 characters long and contain at least one uppercase letter, " +
                "one lowercase letter, and one number"
            );
        }
    }
}
