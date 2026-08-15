package com.healthguardian.service;

import com.healthguardian.dto.AuthResponse;
import com.healthguardian.dto.SignUpRequest;
import com.healthguardian.entity.Role;
import com.healthguardian.entity.SimpleUser;
import com.healthguardian.entity.VerificationToken;
import com.healthguardian.exception.EmailAlreadyExistsException;
import com.healthguardian.repository.UserRepository;
import com.healthguardian.repository.VerificationTokenRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 🧪 TEST UNITAIRE - AuthService
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private VerificationTokenRepository verificationTokenRepository;
    @Mock
    private RoleService roleService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("✅ signUp should throw exception if email exists")
    void testSignUpEmailExists() {
        SignUpRequest request = new SignUpRequest();
        request.setEmail("existing@test.com");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () -> authService.signUp(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("✅ signUp should create user and send email")
    void testSignUpSuccess() {
        SignUpRequest request = new SignUpRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john@test.com");
        request.setPassword("password123");

        Role role = new Role();
        role.setName("SIMPLE_USER");

        SimpleUser savedUser = new SimpleUser();
        savedUser.setId(1L);
        savedUser.setEmail("john@test.com");
        savedUser.setFirstName("John");
        savedUser.setLastName("Doe");
        savedUser.setRole(role);
        savedUser.setIsProfileComplete(false);

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(roleService.getRoleByName("SIMPLE_USER")).thenReturn(role);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPass");
        when(userRepository.save(any(SimpleUser.class))).thenReturn(savedUser);
        when(jwtService.generateToken(any(SimpleUser.class))).thenReturn("jwt-token");

        AuthResponse response = authService.signUp(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("john@test.com", response.getEmail());

        verify(emailService).sendVerificationEmail(eq("john@test.com"), anyString());
        verify(verificationTokenRepository).save(any(VerificationToken.class));
    }
}
