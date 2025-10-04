package com.namhatta.service;

import com.namhatta.dto.LoginRequest;
import com.namhatta.dto.LoginResponse;
import com.namhatta.dto.UserInfo;
import com.namhatta.model.entity.User;
import com.namhatta.model.entity.UserDistrict;
import com.namhatta.model.enums.UserRole;
import com.namhatta.repository.UserDistrictRepository;
import com.namhatta.repository.UserRepository;
import com.namhatta.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserDistrictRepository userDistrictRepository;

    @Mock
    private PasswordService passwordService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private SessionService sessionService;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    @InjectMocks
    private AuthenticationService authenticationService;

    private User testUser;
    private UserDistrict testDistrict;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPasswordHash("hashedPassword123");
        testUser.setFullName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setRole(UserRole.DISTRICT_SUPERVISOR);
        testUser.setIsActive(true);

        testDistrict = new UserDistrict();
        testDistrict.setUserId(1L);
        testDistrict.setDistrictCode("TEST_DIST");
        testDistrict.setDistrictNameEnglish("Test District");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");
    }

    @Test
    void login_WithValidCredentials_ShouldReturnLoginResponse() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordService.verifyPassword("password123", "hashedPassword123")).thenReturn(true);
        when(sessionService.createSession(1L)).thenReturn("session-token-123");
        when(userDistrictRepository.findByUserId(1L)).thenReturn(List.of(testDistrict));
        when(jwtTokenProvider.generateToken(eq(1L), eq("testuser"), eq("DISTRICT_SUPERVISOR"), anyList(), eq("session-token-123")))
                .thenReturn("jwt-token-123");

        LoginResponse response = authenticationService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getUser()).isNotNull();
        assertThat(response.getUser().getId()).isEqualTo(1L);
        assertThat(response.getUser().getUsername()).isEqualTo("testuser");
        assertThat(response.getUser().getRole()).isEqualTo(UserRole.DISTRICT_SUPERVISOR);
        assertThat(response.getToken()).isEqualTo("jwt-token-123");
        assertThat(response.getUser().getDistricts()).hasSize(1);

        verify(userRepository).findByUsername("testuser");
        verify(passwordService).verifyPassword("password123", "hashedPassword123");
        verify(sessionService).createSession(1L);
        verify(jwtTokenProvider).generateToken(eq(1L), eq("testuser"), eq("DISTRICT_SUPERVISOR"), anyList(), eq("session-token-123"));
    }

    @Test
    void login_WithInvalidUsername_ShouldThrowBadCredentialsException() {
        when(userRepository.findByUsername("invaliduser")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authenticationService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid credentials");

        verify(userRepository).findByUsername("testuser");
        verify(passwordService, never()).verifyPassword(anyString(), anyString());
    }

    @Test
    void login_WithInvalidPassword_ShouldThrowBadCredentialsException() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordService.verifyPassword("wrongpassword", "hashedPassword123")).thenReturn(false);
        loginRequest.setPassword("wrongpassword");

        assertThatThrownBy(() -> authenticationService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid credentials");

        verify(userRepository).findByUsername("testuser");
        verify(passwordService).verifyPassword("wrongpassword", "hashedPassword123");
        verify(sessionService, never()).createSession(anyLong());
    }

    @Test
    void login_WithInactiveUser_ShouldThrowBadCredentialsException() {
        testUser.setIsActive(false);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        assertThatThrownBy(() -> authenticationService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid credentials");

        verify(userRepository).findByUsername("testuser");
        verify(passwordService, never()).verifyPassword(anyString(), anyString());
    }

    @Test
    void logout_WithValidToken_ShouldBlacklistTokenAndRemoveSession() {
        String token = "jwt-token-123";
        when(jwtTokenProvider.getUserIdFromToken(token)).thenReturn(1L);

        authenticationService.logout(token);

        verify(tokenBlacklistService).blacklistToken(token);
        verify(sessionService).removeSession(1L);
    }

    @Test
    void verifyToken_WithValidToken_ShouldReturnUserInfo() {
        String token = "jwt-token-123";
        String sessionToken = "session-token-123";
        
        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(tokenBlacklistService.isTokenBlacklisted(anyString())).thenReturn(false);
        when(jwtTokenProvider.getUserIdFromToken(token)).thenReturn(1L);
        when(jwtTokenProvider.getClaimsFromToken(token)).thenReturn(
            new io.jsonwebtoken.impl.DefaultClaims(
                java.util.Map.of("sessionToken", sessionToken)
            )
        );
        when(sessionService.validateSession(1L, sessionToken)).thenReturn(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userDistrictRepository.findByUserId(1L)).thenReturn(List.of(testDistrict));

        UserInfo userInfo = authenticationService.verifyToken(token);

        assertThat(userInfo).isNotNull();
        assertThat(userInfo.getId()).isEqualTo(1L);
        assertThat(userInfo.getUsername()).isEqualTo("testuser");
        assertThat(userInfo.getRole()).isEqualTo(UserRole.DISTRICT_SUPERVISOR);
        assertThat(userInfo.getDistricts()).hasSize(1);

        verify(jwtTokenProvider).validateToken(token);
        verify(tokenBlacklistService).isTokenBlacklisted(anyString());
        verify(sessionService).validateSession(1L, sessionToken);
    }

    @Test
    void verifyToken_WithBlacklistedToken_ShouldThrowException() {
        String token = "jwt-token-123";
        
        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(tokenBlacklistService.isTokenBlacklisted(anyString())).thenReturn(true);

        assertThatThrownBy(() -> authenticationService.verifyToken(token))
                .isInstanceOf(RuntimeException.class);

        verify(jwtTokenProvider).validateToken(token);
        verify(tokenBlacklistService).isTokenBlacklisted(anyString());
        verify(sessionService, never()).validateSession(anyLong(), anyString());
    }

    @Test
    void verifyToken_WithInvalidSession_ShouldThrowException() {
        String token = "jwt-token-123";
        String sessionToken = "session-token-123";
        
        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(tokenBlacklistService.isTokenBlacklisted(anyString())).thenReturn(false);
        when(jwtTokenProvider.getUserIdFromToken(token)).thenReturn(1L);
        when(jwtTokenProvider.getClaimsFromToken(token)).thenReturn(
            new io.jsonwebtoken.impl.DefaultClaims(
                java.util.Map.of("sessionToken", sessionToken)
            )
        );
        when(sessionService.validateSession(1L, sessionToken)).thenReturn(false);

        assertThatThrownBy(() -> authenticationService.verifyToken(token))
                .isInstanceOf(RuntimeException.class);

        verify(sessionService).validateSession(1L, sessionToken);
    }
}
