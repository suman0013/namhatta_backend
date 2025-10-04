package com.namhatta.controller;

import com.namhatta.dto.*;
import com.namhatta.security.CustomUserDetails;
import com.namhatta.service.AuthenticationService;
import com.namhatta.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authenticationService.login(request);
        
        // Create HTTP-only cookie for JWT token
        ResponseCookie cookie = ResponseCookie.from("auth_token", response.getToken())
                .httpOnly(true)
                .secure(true) // HTTPS only in production
                .sameSite("Strict")
                .path("/")
                .maxAge(3600) // 1 hour
                .build();

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("user", response.getUser());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(responseBody);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @CookieValue(value = "auth_token", required = false) String token) {
        
        if (token != null && !token.isEmpty()) {
            authenticationService.logout(token);
        }

        // Create expired cookie to clear it
        ResponseCookie expiredCookie = ResponseCookie.from("auth_token", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();

        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredCookie.toString())
                .body(response);
    }

    @GetMapping("/verify")
    public ResponseEntity<UserInfo> verify(
            @CookieValue(value = "auth_token", required = false) String token) {
        
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        try {
            UserInfo userInfo = authenticationService.verifyToken(token);
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping("/user-districts")
    public ResponseEntity<List<DistrictDTO>> getUserDistricts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) principal;
            Long userId = userDetails.getUserId();
            List<DistrictDTO> districts = userService.getUserDistricts(userId);
            return ResponseEntity.ok(districts);
        }

        return ResponseEntity.status(401).build();
    }
}
