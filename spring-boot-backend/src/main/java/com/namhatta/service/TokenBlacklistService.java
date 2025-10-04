package com.namhatta.service;

import com.namhatta.model.entity.JwtBlacklist;
import com.namhatta.repository.JwtBlacklistRepository;
import com.namhatta.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
public class TokenBlacklistService {
    
    private final JwtBlacklistRepository blacklistRepository;
    private final JwtTokenProvider jwtTokenProvider;
    
    public TokenBlacklistService(JwtBlacklistRepository blacklistRepository, 
                                 JwtTokenProvider jwtTokenProvider) {
        this.blacklistRepository = blacklistRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }
    
    /**
     * Add token to blacklist
     */
    @Transactional
    public void blacklistToken(String token) {
        String tokenHash = jwtTokenProvider.hashToken(token);
        
        // Get expiration time from token
        Claims claims = jwtTokenProvider.getClaimsFromToken(token);
        Date expiration = claims.getExpiration();
        LocalDateTime expiredAt = expiration.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
        
        JwtBlacklist blacklist = new JwtBlacklist();
        blacklist.setTokenHash(tokenHash);
        blacklist.setExpiredAt(expiredAt);
        
        blacklistRepository.save(blacklist);
    }
    
    /**
     * Check if token is blacklisted
     */
    public boolean isTokenBlacklisted(String tokenHash) {
        return blacklistRepository.existsByTokenHash(tokenHash);
    }
    
    /**
     * Clean up expired tokens from blacklist
     * Runs daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        blacklistRepository.deleteByExpiredAtBefore(now);
    }
}
