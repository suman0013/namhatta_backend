package com.namhatta.security;

import com.namhatta.model.entity.User;
import com.namhatta.model.entity.UserDistrict;
import com.namhatta.repository.UserDistrictRepository;
import com.namhatta.repository.UserRepository;
import com.namhatta.service.SessionService;
import com.namhatta.service.TokenBlacklistService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;
    private final SessionService sessionService;
    private final UserRepository userRepository;
    private final UserDistrictRepository userDistrictRepository;
    
    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                   TokenBlacklistService tokenBlacklistService,
                                   SessionService sessionService,
                                   UserRepository userRepository,
                                   UserDistrictRepository userDistrictRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.tokenBlacklistService = tokenBlacklistService;
        this.sessionService = sessionService;
        this.userRepository = userRepository;
        this.userDistrictRepository = userDistrictRepository;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = extractJwtFromCookie(request);
            
            if (jwt != null && jwtTokenProvider.validateToken(jwt)) {
                // Get user ID from token
                Long userId = jwtTokenProvider.getUserIdFromToken(jwt);
                
                // Check if token is blacklisted
                String tokenHash = jwtTokenProvider.hashToken(jwt);
                if (tokenBlacklistService.isTokenBlacklisted(tokenHash)) {
                    filterChain.doFilter(request, response);
                    return;
                }
                
                // Get session token from JWT claims
                Claims claims = jwtTokenProvider.getClaimsFromToken(jwt);
                String sessionToken = claims.get("sessionToken", String.class);
                
                // Validate session
                if (!sessionService.validateSession(userId, sessionToken)) {
                    filterChain.doFilter(request, response);
                    return;
                }
                
                // Load user from repository
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isEmpty() || !userOpt.get().getIsActive()) {
                    filterChain.doFilter(request, response);
                    return;
                }
                
                User user = userOpt.get();
                
                // Load user districts
                List<UserDistrict> userDistricts = userDistrictRepository.findByUserId(userId);
                List<String> districts = userDistricts.stream()
                        .map(UserDistrict::getDistrictCode)
                        .collect(Collectors.toList());
                
                // Create user details
                CustomUserDetails userDetails = new CustomUserDetails(user, districts);
                
                // Create authentication token
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Set authentication in security context
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: ", e);
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * Extract JWT from cookie
     */
    private String extractJwtFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("auth_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
