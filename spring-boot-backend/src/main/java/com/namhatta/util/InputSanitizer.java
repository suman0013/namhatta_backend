package com.namhatta.util;

import org.springframework.stereotype.Component;

@Component
public class InputSanitizer {
    
    /**
     * Sanitize string input by trimming whitespace and escaping HTML
     */
    public String sanitize(String input) {
        if (input == null) {
            return null;
        }
        
        // Trim whitespace
        String sanitized = input.trim();
        
        // HTML escape to prevent XSS
        sanitized = htmlEscape(sanitized);
        
        return sanitized;
    }
    
    /**
     * HTML escape special characters to prevent XSS attacks
     */
    private String htmlEscape(String input) {
        if (input == null) {
            return null;
        }
        
        return input
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#x27;")
            .replace("/", "&#x2F;");
    }
    
    /**
     * Sanitize potentially dangerous SQL-like input
     */
    public String sanitizeSql(String input) {
        if (input == null) {
            return null;
        }
        
        // Remove SQL injection patterns
        String sanitized = input.trim();
        
        // Remove common SQL injection keywords (basic protection, JPA handles the rest)
        sanitized = sanitized.replaceAll("(?i)(;|--|\\/\\*|\\*\\/|xp_|sp_)", "");
        
        return sanitized;
    }
}
