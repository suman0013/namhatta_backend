package com.namhatta.service;

import com.namhatta.model.entity.UserSession;
import com.namhatta.repository.UserSessionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class SessionService {
    
    private final UserSessionRepository sessionRepository;
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final long SESSION_DURATION_HOURS = 1;
    
    public SessionService(UserSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }
    
    /**
     * Create a new session for a user (enforces single login)
     */
    @Transactional
    public String createSession(Long userId) {
        // Delete existing session (single login enforcement)
        sessionRepository.deleteByUserId(userId);
        
        // Generate session token
        String sessionToken = generateSessionToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(SESSION_DURATION_HOURS);
        
        UserSession session = new UserSession();
        session.setUserId(userId);
        session.setSessionToken(sessionToken);
        session.setExpiresAt(expiresAt);
        
        sessionRepository.save(session);
        
        return sessionToken;
    }
    
    /**
     * Validate session
     */
    public boolean validateSession(Long userId, String sessionToken) {
        Optional<UserSession> sessionOpt = sessionRepository.findByUserId(userId);
        
        if (sessionOpt.isEmpty()) {
            return false;
        }
        
        UserSession session = sessionOpt.get();
        
        // Check if session token matches
        if (!session.getSessionToken().equals(sessionToken)) {
            return false;
        }
        
        // Check if session is not expired
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Remove session for a user
     */
    @Transactional
    public void removeSession(Long userId) {
        sessionRepository.deleteByUserId(userId);
    }
    
    /**
     * Clean up expired sessions
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * ?")
    @Transactional
    public void cleanupExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        sessionRepository.deleteByExpiresAtBefore(now);
    }
    
    /**
     * Generate a secure random session token
     */
    private String generateSessionToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        
        StringBuilder token = new StringBuilder();
        for (byte b : randomBytes) {
            token.append(String.format("%02x", b));
        }
        
        return token.toString();
    }
}
