package com.healthguardian.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 🧪 TEST UNITAIRE - AuthResponse DTO
 * 
 * 🎯 OBJECTIF: Tester les constructeurs, getters, setters et builder
 * 
 * 💡 COUVERTURE:
 * - Constructeur par défaut
 * - Constructeur personnalisé
 * - Builder pattern
 * - Getters/Setters
 * - Valeur par défaut de "type"
 */
@DisplayName("AuthResponse DTO - Tests Unitaires")
class AuthResponseTest {

    @Test
    @DisplayName("✅ NoArgsConstructor - Devrait créer un objet vide")
    void testNoArgsConstructor() {
        // ACT
        AuthResponse response = new AuthResponse();

        // ASSERT
        assertNotNull(response);
        assertEquals("Bearer", response.getType()); // Valeur par défaut
        assertNull(response.getToken());
        assertNull(response.getUserId());
    }

    @Test
    @DisplayName("✅ AllArgsConstructor - Devrait créer un objet complet")
    void testAllArgsConstructor() {
        // ACT
        AuthResponse response = new AuthResponse(
                "jwt-token-123",
                "Bearer",
                1L,
                "john.doe@test.com",
                "John",
                "Doe",
                "SIMPLE_USER",
                true,
                "Login successful",
                true
        );

        // ASSERT
        assertEquals("jwt-token-123", response.getToken());
        assertEquals("Bearer", response.getType());
        assertEquals(1L, response.getUserId());
        assertEquals("john.doe@test.com", response.getEmail());
        assertEquals("John", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        assertEquals("SIMPLE_USER", response.getRole());
        assertTrue(response.getIsProfileComplete());
        assertEquals("Login successful", response.getMessage());
        assertTrue(response.getIsActive());
    }

    @Test
    @DisplayName("✅ Custom Constructor - Devrait créer avec 7 paramètres")
    void testCustomConstructor() {
        // ACT
        AuthResponse response = new AuthResponse(
                "jwt-token-456",
                2L,
                "jane.smith@test.com",
                "Jane",
                "Smith",
                "DOCTOR",
                false
        );

        // ASSERT
        assertEquals("jwt-token-456", response.getToken());
        assertEquals("Bearer", response.getType()); // Défini dans le constructeur
        assertEquals(2L, response.getUserId());
        assertEquals("jane.smith@test.com", response.getEmail());
        assertEquals("Jane", response.getFirstName());
        assertEquals("Smith", response.getLastName());
        assertEquals("DOCTOR", response.getRole());
        assertFalse(response.getIsProfileComplete());
    }

    @Test
    @DisplayName("✅ Builder - Devrait créer avec builder pattern")
    void testBuilder() {
        // ACT
        AuthResponse response = AuthResponse.builder()
                .token("builder-token")
                .type("Bearer")
                .userId(3L)
                .email("admin@test.com")
                .firstName("Admin")
                .lastName("User")
                .role("ADMIN")
                .isProfileComplete(true)
                .message("Welcome Admin")
                .isActive(true)
                .build();

        // ASSERT
        assertEquals("builder-token", response.getToken());
        assertEquals("Bearer", response.getType());
        assertEquals(3L, response.getUserId());
        assertEquals("admin@test.com", response.getEmail());
        assertEquals("Admin", response.getFirstName());
        assertEquals("User", response.getLastName());
        assertEquals("ADMIN", response.getRole());
        assertTrue(response.getIsProfileComplete());
        assertEquals("Welcome Admin", response.getMessage());
        assertTrue(response.getIsActive());
    }

    @Test
    @DisplayName("✅ Setters - Devrait modifier les valeurs")
    void testSetters() {
        // ARRANGE
        AuthResponse response = new AuthResponse();

        // ACT
        response.setToken("new-token");
        response.setType("Custom");
        response.setUserId(99L);
        response.setEmail("updated@test.com");
        response.setFirstName("Updated");
        response.setLastName("Name");
        response.setRole("PHARMACY");
        response.setIsProfileComplete(false);
        response.setMessage("Updated message");
        response.setIsActive(false);

        // ASSERT
        assertEquals("new-token", response.getToken());
        assertEquals("Custom", response.getType());
        assertEquals(99L, response.getUserId());
        assertEquals("updated@test.com", response.getEmail());
        assertEquals("Updated", response.getFirstName());
        assertEquals("Name", response.getLastName());
        assertEquals("PHARMACY", response.getRole());
        assertFalse(response.getIsProfileComplete());
        assertEquals("Updated message", response.getMessage());
        assertFalse(response.getIsActive());
    }

    @Test
    @DisplayName("✅ Default Type Value - Type devrait être 'Bearer' par défaut")
    void testDefaultTypeValue() {
        // ACT
        AuthResponse response1 = new AuthResponse();
        AuthResponse response2 = AuthResponse.builder().build();

        // ASSERT
        assertEquals("Bearer", response1.getType());
        assertNull(response2.getType()); // Builder ne définit pas de valeur par défaut
    }

    @Test
    @DisplayName("✅ Null Values - Devrait accepter des valeurs null")
    void testNullValues() {
        // ACT
        AuthResponse response = AuthResponse.builder()
                .token(null)
                .userId(null)
                .email(null)
                .build();

        // ASSERT
        assertNull(response.getToken());
        assertNull(response.getUserId());
        assertNull(response.getEmail());
    }
}
