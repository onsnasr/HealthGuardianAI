package com.healthguardian.repository;

import com.healthguardian.entity.VerificationToken;
import com.healthguardian.entity.User;
import com.healthguardian.entity.SimpleUser;
import com.healthguardian.entity.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 🔗 TEST D'INTÉGRATION - VerificationTokenRepository
 * 
 * Tests des tokens de vérification email et reset password
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("VerificationTokenRepository - Tests d'Intégration")
class VerificationTokenRepositoryTest {

    @Autowired
    private VerificationTokenRepository tokenRepository;

    @Autowired
    private TestEntityManager entityManager;

    private User testUser;
    private VerificationToken testToken;

    @BeforeEach
    void setUp() {
        // Créer et persister un Role
        Role patientRole = new Role();
        patientRole.setName("PATIENT");
        entityManager.persist(patientRole);

        // Créer un utilisateur
        testUser = new SimpleUser();
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setEmail("test@email.com");
        testUser.setPassword("password");
        testUser.setRole(patientRole); // FIX: Role required
        testUser = entityManager.persistAndFlush(testUser);

        // Créer un token
        testToken = new VerificationToken();
        testToken.setToken("test-token-123");
        testToken.setUser(testUser);
        testToken.setTokenType(VerificationToken.TokenType.EMAIL_VERIFICATION);
        testToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        testToken.setIsUsed(false);
    }

    @Test
    @DisplayName("✅ findByToken() - Devrait trouver token par valeur")
    void testFindByToken() {
        tokenRepository.save(testToken);

        Optional<VerificationToken> result = tokenRepository.findByToken("test-token-123");

        assertTrue(result.isPresent());
        assertEquals("test-token-123", result.get().getToken());
    }

    @Test
    @DisplayName("✅ findByUserAndTokenType() - Devrait trouver par user et type")
    void testFindByUserAndTokenType() {
        tokenRepository.save(testToken);

        Optional<VerificationToken> result = tokenRepository
            .findByUserAndTokenType(testUser, VerificationToken.TokenType.EMAIL_VERIFICATION);

        assertTrue(result.isPresent());
        assertEquals(testUser.getId(), result.get().getUser().getId());
    }

    @Test
    @DisplayName("✅ isExpired() - Devrait détecter expiration")
    void testTokenExpiration() {
        // Token expiré
        testToken.setExpiryDate(LocalDateTime.now().minusHours(1));
        tokenRepository.save(testToken);

        VerificationToken saved = tokenRepository.findByToken("test-token-123").get();
        assertTrue(saved.isExpired());
    }
}
