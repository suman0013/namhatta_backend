package com.namhatta.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class RateLimitService {

    private final Cache<String, RateLimitBucket> loginCache;
    private final Cache<String, RateLimitBucket> apiCache;

    public RateLimitService() {
        this.loginCache = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(15))
                .build();

        this.apiCache = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(1))
                .build();
    }

    public boolean allowLoginRequest(String clientIp) {
        return checkRateLimit(loginCache, clientIp, 5, 900); // 5 requests per 15 minutes
    }

    public boolean allowApiRequest(String clientIp) {
        return checkRateLimit(apiCache, clientIp, 100, 60); // 100 requests per minute
    }

    private boolean checkRateLimit(Cache<String, RateLimitBucket> cache, String key, int maxRequests, int windowSeconds) {
        RateLimitBucket bucket = cache.get(key, k -> new RateLimitBucket(maxRequests, windowSeconds));
        return bucket.tryConsume();
    }

    private static class RateLimitBucket {
        private final int maxRequests;
        private final long windowMillis;
        private final ConcurrentMap<Long, Integer> requestCounts;

        public RateLimitBucket(int maxRequests, int windowSeconds) {
            this.maxRequests = maxRequests;
            this.windowMillis = windowSeconds * 1000L;
            this.requestCounts = new ConcurrentHashMap<>();
        }

        public synchronized boolean tryConsume() {
            long currentTimeMillis = System.currentTimeMillis();
            long windowStart = currentTimeMillis - windowMillis;

            // Remove old entries
            requestCounts.entrySet().removeIf(entry -> entry.getKey() < windowStart);

            // Count requests in current window
            int totalRequests = requestCounts.values().stream()
                    .mapToInt(Integer::intValue)
                    .sum();

            if (totalRequests >= maxRequests) {
                return false;
            }

            // Add current request
            requestCounts.merge(currentTimeMillis, 1, Integer::sum);
            return true;
        }
    }
}
