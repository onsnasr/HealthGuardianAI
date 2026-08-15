package com.healthguardian.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthguardian.dto.AuthResponse;
import com.healthguardian.dto.SignInRequest;
import com.healthguardian.dto.SignUpRequest;
import com.healthguardian.entity.User;
import com.healthguardian.repository.UserRepository;
import com.healthguardian.service.AuthService;
import com.healthguardian.service.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 🧪 TEST FONCTIONNEL - AuthController
 */
@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // Bypass Security Filters for unit testing logic
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtService jwtService; // Often required by security config even if filters are off

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("✅ POST /api/auth/signup should return created status")
    void testSignUp() throws Exception {
        SignUpRequest request = new SignUpRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("test@test.com");
        request.setPassword("StrongP@ssw0rd!"); // Meets complexity requirements

        AuthResponse response = AuthResponse.builder()
                .token("jwt-token")
                .email("test@test.com")
                .build();

        when(authService.signUp(any(SignUpRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @Test
    @DisplayName("✅ POST /api/auth/signin should return ok status")
    void testSignIn() throws Exception {
        SignInRequest request = new SignInRequest();
        request.setEmail("test@test.com");
        request.setPassword("pass");

        AuthResponse response = AuthResponse.builder()
                .token("jwt-token")
                .email("test@test.com")
                .build();

        when(authService.signIn(any(SignInRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @Test
    @DisplayName("✅ GET /api/auth/check-verification should return user status")
    void testCheckVerification() throws Exception {
        User user = new User() {
            @Override
            public boolean isAccountNonExpired() { return true; }
            @Override
            public boolean isAccountNonLocked() { return true; }
            @Override
            public boolean isCredentialsNonExpired() { return true; }
            @Override
            public boolean isEnabled() { return true; }
        };
        user.setId(1L);
        user.setEmail("test@test.com");
        user.setIsActive(true);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/auth/check-verification")
                        .param("email", "test@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(true));
    }
}
