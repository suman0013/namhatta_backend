package com.namhatta.service;

import com.namhatta.dto.LoginRequest;
import com.namhatta.dto.LoginResponse;
import com.namhatta.dto.UserInfo;
import com.namhatta.model.entity.User;
import com.namhatta.model.entity.UserDistrict;
import com.namhatta.repository.UserDistrictRepository;
import com.namhatta.repository.UserRepository;
import com.namhatta.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthenticationService {
    
    private final UserRepository userRepository;
    private final UserDistrictRepository userDistrictRepository;
    private final PasswordService passwordService;
    private final JwtTokenProvider jwtTokenProvider;
    private final SessionService sessionService;
    private final TokenBlacklistService tokenBlacklistService;
    
    public AuthenticationService(UserRepository userRepository,
                                 UserDistrictRepository userDistrictRepository,
                                 PasswordService passwordService,
                                 JwtTokenProvider jwtTokenProvider,
                                 SessionService sessionService,
                                 TokenBlacklistService tokenBlacklistService) {
        this.userRepository = userRepository;
        this.userDistrictRepository = userDistrictRepository;
        this.passwordService = passwordService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.sessionService = sessionService;
        this.tokenBlacklistService = tokenBlacklistService;
    }
    
    /**
     * Authenticate user and return JWT token
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        // Validate input
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new BadCredentialsException("Username is required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new BadCredentialsException("Password is required");
        }
        
        // Find user by username
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            throw new BadCredentialsException("Invalid username or password");
        }
        
        User user = userOpt.get();
        
        // Check if user is active
        if (!user.getIsActive()) {
            throw new BadCredentialsException("User account is deactivated");
        }
        
        // Verify password
        if (!passwordService.verifyPassword(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }
        
        // Create new session (enforces single login - deletes old session)
        String sessionToken = sessionService.createSession(user.getId());
        
        // Get user districts
        List<UserDistrict> userDistricts = userDistrictRepository.findByUserId(user.getId());
        List<String> districtCodes = userDistricts.stream()
                .map(UserDistrict::getDistrictCode)
                .collect(Collectors.toList());
        
        List<DistrictDTO> districts = userDistricts.stream()
                .map(ud -> new DistrictDTO(ud.getDistrictCode(), ud.getDistrictNameEnglish()))
                .collect(Collectors.toList());
        
        // Generate JWT token
        String jwt = jwtTokenProvider.generateToken(
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                districtCodes,
                sessionToken
        );
        
        // Create UserDTO
        UserDTO userDto = new UserDTO();
        userDto.setId(user.getId());
        userDto.setUsername(user.getUsername());
        userDto.setFullName(user.getFullName());
        userDto.setEmail(user.getEmail());
        userDto.setRole(user.getRole().name());
        userDto.setDevoteeId(user.getDevoteeId());
        userDto.setIsActive(user.getIsActive());
        userDto.setDistricts(districts);
        
        // Return login response
        return new LoginResponse(userDto, jwt);
    }
    
    /**
     * Logout user by blacklisting token and removing session
     */
    @Transactional
    public void logout(String token) {
        // Blacklist the token
        tokenBlacklistService.blacklistToken(token);
        
        // Get user ID from token
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        
        // Remove session
        sessionService.removeSession(userId);
    }
    
    /**
     * Verify token and return user information
     */
    public UserInfo verifyToken(String token) {
        // Validate JWT
        if (!jwtTokenProvider.validateToken(token)) {
            throw new BadCredentialsException("Invalid or expired token");
        }
        
        // Check if blacklisted
        String tokenHash = jwtTokenProvider.hashToken(token);
        if (tokenBlacklistService.isTokenBlacklisted(tokenHash)) {
            throw new BadCredentialsException("Token has been revoked");
        }
        
        // Get user ID and session token from claims
        Claims claims = jwtTokenProvider.getClaimsFromToken(token);
        Long userId = Long.parseLong(claims.getSubject());
        String sessionToken = claims.get("sessionToken", String.class);
        
        // Validate session
        if (!sessionService.validateSession(userId, sessionToken)) {
            throw new BadCredentialsException("Session is invalid or expired");
        }
        
        // Get current user from repository
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty() || !userOpt.get().getIsActive()) {
            throw new BadCredentialsException("User not found or inactive");
        }
        
        User user = userOpt.get();
        
        // Get current districts (may have changed since login)
        List<UserDistrict> userDistricts = userDistrictRepository.findByUserId(userId);
        List<String> districts = userDistricts.stream()
                .map(UserDistrict::getDistrictCode)
                .collect(Collectors.toList());
        
        // Return user info
        return new UserInfo(
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                districts
        );
    }
}
