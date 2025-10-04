package com.namhatta.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.namhatta.dto.LoginRequest;
import com.namhatta.model.entity.User;
import com.namhatta.model.enums.UserRole;
import com.namhatta.repository.UserRepository;
import com.namhatta.service.PasswordService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordService passwordService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("integrationtest");
        testUser.setPasswordHash(passwordService.hashPassword("testpass123"));
        testUser.setFullName("Integration Test User");
        testUser.setEmail("integration@test.com");
        testUser.setRole(UserRole.ADMIN);
        testUser.setIsActive(true);
        testUser = userRepository.save(testUser);
    }

    @Test
    void login_WithValidCredentials_ShouldReturnTokenAndUserInfo() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("integrationtest");
        loginRequest.setPassword("testpass123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.id").value(testUser.getId()))
                .andExpect(jsonPath("$.user.username").value("integrationtest"))
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andExpect(cookie().exists("auth_token"))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        assertThat(responseBody).contains("token");
    }

    @Test
    void login_WithInvalidCredentials_ShouldReturn401() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("integrationtest");
        loginRequest.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void verify_WithValidToken_ShouldReturnUserInfo() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("integrationtest");
        loginRequest.setPassword("testpass123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        String authTokenCookie = loginResult.getResponse().getCookie("auth_token").getValue();

        mockMvc.perform(get("/api/auth/verify")
                        .cookie(new jakarta.servlet.http.Cookie("auth_token", authTokenCookie)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUser.getId()))
                .andExpect(jsonPath("$.username").value("integrationtest"));
    }

    @Test
    void verify_WithoutToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/auth/verify"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logout_WithValidToken_ShouldBlacklistToken() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("integrationtest");
        loginRequest.setPassword("testpass123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        String authTokenCookie = loginResult.getResponse().getCookie("auth_token").getValue();

        mockMvc.perform(post("/api/auth/logout")
                        .cookie(new jakarta.servlet.http.Cookie("auth_token", authTokenCookie)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/auth/verify")
                        .cookie(new jakarta.servlet.http.Cookie("auth_token", authTokenCookie)))
                .andExpect(status().isUnauthorized());
    }
}
