package com.healthguardian.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 🧪 TEST UNITAIRE - SignInRequest DTO
 * 
 * 🎯 OBJECTIF: Tester les validations et les propriétés du DTO
 * 
 * 💡 COUVERTURE:
 * - Constructeurs
 * - Validations @NotBlank et @Email
 * - Getters/Setters
 * - Cas limites (null, vide, email invalide)
 */
@DisplayName("SignInRequest DTO - Tests Unitaires")
class SignInRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("✅ NoArgsConstructor - Devrait créer un objet vide")
    void testNoArgsConstructor() {
        // ACT
        SignInRequest request = new SignInRequest();

        // ASSERT
        assertNotNull(request);
        assertNull(request.getEmail());
        assertNull(request.getPassword());
    }

    @Test
    @DisplayName("✅ AllArgsConstructor - Devrait créer un objet avec valeurs")
    void testAllArgsConstructor() {
        // ACT
        SignInRequest request = new SignInRequest("user@test.com", "password123");

        // ASSERT
        assertEquals("user@test.com", request.getEmail());
        assertEquals("password123", request.getPassword());
    }

    @Test
    @DisplayName("✅ Setters - Devrait modifier les valeurs")
    void testSetters() {
        // ARRANGE
        SignInRequest request = new SignInRequest();

        // ACT
        request.setEmail("updated@test.com");
        request.setPassword("newPassword");

        // ASSERT
        assertEquals("updated@test.com", request.getEmail());
        assertEquals("newPassword", request.getPassword());
    }

    @Test
    @DisplayName("✅ Validation - Données valides devraient passer")
    void testValidData() {
        // ARRANGE
        SignInRequest request = new SignInRequest("valid.email@test.com", "validPassword123");

        // ACT
        Set<ConstraintViolation<SignInRequest>> violations = validator.validate(request);

        // ASSERT
        assertTrue(violations.isEmpty(), "Aucune violation ne devrait être détectée");
    }

    @Test
    @DisplayName("❌ Validation - Email null devrait échouer")
    void testNullEmail() {
        // ARRANGE
        SignInRequest request = new SignInRequest(null, "password123");

        // ACT
        Set<ConstraintViolation<SignInRequest>> violations = validator.validate(request);

        // ASSERT
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Email is required")));
    }


    @Test
    @DisplayName("❌ Validation - Email invalide devrait échouer")
    void testInvalidEmail() {
        // ARRANGE
        SignInRequest request = new SignInRequest("not-an-email", "password123");

        // ACT
        Set<ConstraintViolation<SignInRequest>> violations = validator.validate(request);

        // ASSERT
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Email must be valid")));
    }

    @Test
    @DisplayName("❌ Validation - Password null devrait échouer")
    void testNullPassword() {
        // ARRANGE
        SignInRequest request = new SignInRequest("user@test.com", null);

        // ACT
        Set<ConstraintViolation<SignInRequest>> violations = validator.validate(request);

        // ASSERT
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Password is required")));
    }

    @Test
    @DisplayName("❌ Validation - Password vide devrait échouer")
    void testBlankPassword() {
        // ARRANGE
        SignInRequest request = new SignInRequest("user@test.com", "   ");

        // ACT
        Set<ConstraintViolation<SignInRequest>> violations = validator.validate(request);

        // ASSERT
        assertFalse(violations.isEmpty());
        assertEquals(1, violations.size());
    }

    @Test
    @DisplayName("❌ Validation - Email et password vides devraient échouer")
    void testBothFieldsInvalid() {
        // ARRANGE
        SignInRequest request = new SignInRequest("", "");

        // ACT
        Set<ConstraintViolation<SignInRequest>> violations = validator.validate(request);

        // ASSERT
        assertEquals(2, violations.size(), "Devrait avoir 2 violations");
    }

    @Test
    @DisplayName("✅ Edge Case - Email avec caractères spéciaux valides")
    void testEmailWithSpecialCharacters() {
        // ARRANGE
        SignInRequest request = new SignInRequest("user+test@sub.domain.com", "password123");

        // ACT
        Set<ConstraintViolation<SignInRequest>> violations = validator.validate(request);

        // ASSERT
        assertTrue(violations.isEmpty());
    }
}
