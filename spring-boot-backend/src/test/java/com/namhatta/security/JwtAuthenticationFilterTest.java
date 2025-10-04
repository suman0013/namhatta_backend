package com.namhatta.security;

import com.namhatta.model.entity.User;
import com.namhatta.model.entity.UserDistrict;
import com.namhatta.model.enums.UserRole;
import com.namhatta.repository.UserDistrictRepository;
import com.namhatta.repository.UserRepository;
import com.namhatta.service.SessionService;
import com.namhatta.service.TokenBlacklistService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    @Mock
    private SessionService sessionService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserDistrictRepository userDistrictRepository;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private User testUser;
    private UserDistrict testDistrict;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setRole(UserRole.ADMIN);
        testUser.setIsActive(true);

        testDistrict = new UserDistrict();
        testDistrict.setUserId(1L);
        testDistrict.setDistrictCode("TEST_DIST");
        testDistrict.setDistrictNameEnglish("Test District");
    }

    @Test
    void doFilterInternal_WithValidToken_ShouldSetAuthentication() throws Exception {
        String token = "valid-jwt-token";
        String sessionToken = "session-token-123";
        Cookie authCookie = new Cookie("auth_token", token);
        request.setCookies(authCookie);

        Claims claims = Jwts.claims();
        claims.put("sessionToken", sessionToken);

        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromToken(token)).thenReturn(1L);
        when(jwtTokenProvider.getClaimsFromToken(token)).thenReturn(claims);
        when(jwtTokenProvider.hashToken(token)).thenReturn("hashed-token");
        when(tokenBlacklistService.isTokenBlacklisted("hashed-token")).thenReturn(false);
        when(sessionService.validateSession(1L, sessionToken)).thenReturn(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userDistrictRepository.findByUserId(1L)).thenReturn(List.of(testDistrict));

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().isAuthenticated()).isTrue();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WithBlacklistedToken_ShouldReturn401() throws Exception {
        String token = "blacklisted-token";
        Cookie authCookie = new Cookie("auth_token", token);
        request.setCookies(authCookie);

        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(jwtTokenProvider.hashToken(token)).thenReturn("hashed-token");
        when(tokenBlacklistService.isTokenBlacklisted("hashed-token")).thenReturn(true);

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WithInvalidSession_ShouldReturn401() throws Exception {
        String token = "valid-jwt-token";
        String sessionToken = "invalid-session-token";
        Cookie authCookie = new Cookie("auth_token", token);
        request.setCookies(authCookie);

        Claims claims = Jwts.claims();
        claims.put("sessionToken", sessionToken);

        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromToken(token)).thenReturn(1L);
        when(jwtTokenProvider.getClaimsFromToken(token)).thenReturn(claims);
        when(jwtTokenProvider.hashToken(token)).thenReturn("hashed-token");
        when(tokenBlacklistService.isTokenBlacklisted("hashed-token")).thenReturn(false);
        when(sessionService.validateSession(1L, sessionToken)).thenReturn(false);

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WithInactiveUser_ShouldReturn401() throws Exception {
        String token = "valid-jwt-token";
        String sessionToken = "session-token-123";
        Cookie authCookie = new Cookie("auth_token", token);
        request.setCookies(authCookie);

        Claims claims = Jwts.claims();
        claims.put("sessionToken", sessionToken);

        testUser.setIsActive(false);

        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromToken(token)).thenReturn(1L);
        when(jwtTokenProvider.getClaimsFromToken(token)).thenReturn(claims);
        when(jwtTokenProvider.hashToken(token)).thenReturn("hashed-token");
        when(tokenBlacklistService.isTokenBlacklisted("hashed-token")).thenReturn(false);
        when(sessionService.validateSession(1L, sessionToken)).thenReturn(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WithNoToken_ShouldContinueChain() throws Exception {
        // No cookies set on request

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
        verify(jwtTokenProvider, never()).validateToken(anyString());
    }

    @Test
    void doFilterInternal_WithExpiredToken_ShouldReturn401() throws Exception {
        String token = "expired-token";
        Cookie authCookie = new Cookie("auth_token", token);
        request.setCookies(authCookie);

        when(jwtTokenProvider.validateToken(token)).thenReturn(false);

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain, never()).doFilter(request, response);
    }
}
