package com.namhatta.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;

@Component
@Order(2)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final String USER_ID_MDC_KEY = "userId";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        long startTime = System.currentTimeMillis();
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        try {
            // Set userId in MDC from authentication context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getPrincipal())) {
                try {
                    Object principal = authentication.getPrincipal();
                    if (principal instanceof com.namhatta.security.CustomUserDetails) {
                        Long userId = ((com.namhatta.security.CustomUserDetails) principal).getUserId();
                        MDC.put(USER_ID_MDC_KEY, String.valueOf(userId));
                    }
                } catch (Exception e) {
                    // Ignore if we can't get user ID
                }
            }

            // Process the request
            filterChain.doFilter(request, responseWrapper);

        } finally {
            long duration = System.currentTimeMillis() - startTime;

            // Log request details for API endpoints only
            if (request.getRequestURI().startsWith("/api/")) {
                String method = request.getMethod();
                String uri = request.getRequestURI();
                int status = responseWrapper.getStatus();
                
                String logMessage = String.format("%s %s - Status: %d - Duration: %dms",
                        method, uri, status, duration);
                
                if (status >= 400) {
                    logger.warn(logMessage);
                } else {
                    logger.info(logMessage);
                }
            }

            // Copy response content back to original response
            responseWrapper.copyBodyToResponse();
            
            // Clear MDC
            MDC.remove(USER_ID_MDC_KEY);
        }
    }
}
