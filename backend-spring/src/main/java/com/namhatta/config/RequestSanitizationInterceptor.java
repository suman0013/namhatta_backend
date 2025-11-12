package com.namhatta.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor for sanitizing request parameters
 * Note: Request body sanitization should be done at DTO level with custom validators
 */
@Component
public class RequestSanitizationInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(
            HttpServletRequest request, 
            HttpServletResponse response, 
            Object handler) throws Exception {
        
        // Request parameter sanitization can be added here if needed
        // For now, we rely on JSR-303 validation and custom validators at DTO level
        // This provides a hook for future enhancements
        
        return true;
    }
}
