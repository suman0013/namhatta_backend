package com.namhatta.repository;

import com.namhatta.model.entity.JwtBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Repository
public interface JwtBlacklistRepository extends JpaRepository<JwtBlacklist, Long> {
    
    boolean existsByTokenHash(String tokenHash);
    
    @Transactional
    void deleteByExpiredAtBefore(LocalDateTime dateTime);
}
