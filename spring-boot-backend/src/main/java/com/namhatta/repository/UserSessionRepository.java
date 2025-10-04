package com.namhatta.repository;

import com.namhatta.model.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    
    Optional<UserSession> findByUserId(Long userId);
    
    @Transactional
    void deleteByUserId(Long userId);
    
    @Transactional
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
