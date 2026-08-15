package com.healthguardian.service;

import com.healthguardian.entity.Role;
import com.healthguardian.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * 🧪 TEST UNITAIRE - JwtService
 */
@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    private String secretKey = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"; // 256-bit hex key
    private long jwtExpiration = 86400000; // 24h

    @BeforeEach
    void setUp() {
        // Inject values into private fields
        ReflectionTestUtils.setField(jwtService, "secretKey", secretKey);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", jwtExpiration);
    }

    @Test
    @DisplayName("✅ generateToken should create a valid token")
    void testGenerateToken() {
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("test@example.com");

        String token = jwtService.generateToken(userDetails);

        assertNotNull(token);
        assertEquals("test@example.com", jwtService.extractUsername(token));
    }

    @Test
    @DisplayName("✅ generateToken(User) should include extra claims")
    void testGenerateTokenWithUser() {
        User user = mock(User.class);
        Role role = mock(Role.class);
        when(role.getName()).thenReturn("DOCTOR");
        
        when(user.getUsername()).thenReturn("doctor@test.com");
        when(user.getId()).thenReturn(10L);
        when(user.getEmail()).thenReturn("doctor@test.com");
        when(user.getFirstName()).thenReturn("John");
        when(user.getLastName()).thenReturn("Doe");
        when(user.getRole()).thenReturn(role);
        when(user.getIsActive()).thenReturn(true);
        when(user.getIsProfileComplete()).thenReturn(true);

        String token = jwtService.generateToken(user);

        assertNotNull(token);
        assertEquals("doctor@test.com", jwtService.extractUsername(token));
        assertEquals(10L, jwtService.extractUserId(token));
        assertTrue(jwtService.extractIsActive(token));
    }

    @Test
    @DisplayName("✅ Token validation should work correctly")
    void testTokenValidation() {
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("valid@test.com");

        String token = jwtService.generateToken(userDetails);

        assertEquals("valid@test.com", jwtService.extractUsername(token));
        // Check expiration
        Date expiration = jwtService.extractClaim(token, io.jsonwebtoken.Claims::getExpiration);
        assertTrue(expiration.after(new Date()));
    }
}
