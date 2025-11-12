package com.namhatta.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final ObjectMapper objectMapper;

    public RateLimitFilter(RateLimitService rateLimitService, ObjectMapper objectMapper) {
        this.rateLimitService = rateLimitService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String clientIp = getClientIp(request);
        String requestUri = request.getRequestURI();
        String method = request.getMethod();

        // Apply rate limiting to login endpoint
        if ("/api/auth/login".equals(requestUri) && "POST".equals(method)) {
            if (!rateLimitService.allowLoginRequest(clientIp)) {
                sendRateLimitError(response, "Too many login attempts. Please try again in 15 minutes.");
                return;
            }
        }

        // Apply rate limiting to data modification endpoints
        if (requestUri.startsWith("/api/") && 
            (method.equals("POST") || method.equals("PUT") || method.equals("DELETE") || method.equals("PATCH"))) {
            
            // Exclude login from API rate limit (already handled above)
            if (!"/api/auth/login".equals(requestUri)) {
                if (!rateLimitService.allowApiRequest(clientIp)) {
                    sendRateLimitError(response, "Too many API requests. Please slow down.");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    private void sendRateLimitError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Rate limit exceeded");
        errorResponse.put("message", message);
        errorResponse.put("status", 429);

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
