package com.namhatta.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.namhatta.dto.CreateDevoteeRequest;
import com.namhatta.dto.LoginRequest;
import com.namhatta.model.entity.DevotionalStatus;
import com.namhatta.model.entity.User;
import com.namhatta.model.enums.Gender;
import com.namhatta.model.enums.MaritalStatus;
import com.namhatta.model.enums.UserRole;
import com.namhatta.repository.DevotionalStatusRepository;
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

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class DevoteeControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DevotionalStatusRepository statusRepository;

    @Autowired
    private PasswordService passwordService;

    private String adminToken;
    private DevotionalStatus testStatus;

    @BeforeEach
    void setUp() throws Exception {
        User adminUser = new User();
        adminUser.setUsername("adminuser");
        adminUser.setPasswordHash(passwordService.hashPassword("admin123"));
        adminUser.setFullName("Admin User");
        adminUser.setEmail("admin@test.com");
        adminUser.setRole(UserRole.ADMIN);
        adminUser.setIsActive(true);
        userRepository.save(adminUser);

        testStatus = new DevotionalStatus();
        testStatus.setName("Test Status");
        testStatus = statusRepository.save(testStatus);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("adminuser");
        loginRequest.setPassword("admin123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        adminToken = loginResult.getResponse().getCookie("auth_token").getValue();
    }

    @Test
    void getDevotees_WithValidAuth_ShouldReturnPaginatedList() throws Exception {
        mockMvc.perform(get("/api/devotees")
                        .cookie(new jakarta.servlet.http.Cookie("auth_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.pageable").exists());
    }

    @Test
    void getDevotees_WithoutAuth_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/devotees"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createDevotee_AsAdmin_ShouldSucceed() throws Exception {
        CreateDevoteeRequest request = new CreateDevoteeRequest();
        request.setLegalName("Test Create Devotee");
        request.setName("Spiritual Name");
        request.setEmail("create@test.com");
        request.setPhone("9876543210");
        request.setGender(Gender.MALE);
        request.setMaritalStatus(MaritalStatus.UNMARRIED);
        request.setDob(LocalDate.of(1990, 5, 15));
        request.setDevotionalStatusId(testStatus.getId());

        mockMvc.perform(post("/api/devotees")
                        .cookie(new jakarta.servlet.http.Cookie("auth_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.legalName").value("Test Create Devotee"));
    }

    @Test
    void createDevotee_WithInvalidData_ShouldReturn400() throws Exception {
        CreateDevoteeRequest request = new CreateDevoteeRequest();
        // Missing required fields

        mockMvc.perform(post("/api/devotees")
                        .cookie(new jakarta.servlet.http.Cookie("auth_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
