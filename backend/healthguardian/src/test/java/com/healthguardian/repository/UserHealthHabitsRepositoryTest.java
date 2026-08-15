package com.healthguardian.repository;

import com.healthguardian.entity.Role;
import com.healthguardian.entity.SimpleUser;
import com.healthguardian.entity.UserHealthHabits;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 🔗 TEST D'INTÉGRATION - UserHealthHabitsRepository
 * 
 * 🎯 OBJECTIF: Tester les opérations avec la BASE DE DONNÉES (H2 en mémoire)
 * 
 * 💡 COUVERTURE:
 * - findByUserId() - Trouver les habitudes par ID utilisateur
 * - existsByUserId() - Vérifier l'existence des habitudes
 * - deleteByUserId() - Supprimer les habitudes par ID utilisateur
 * - Validation cascade avec SimpleUser
 * 
 * 🔧 @DataJpaTest: Configure automatiquement H2 + JPA
 * 🔧 @ActiveProfiles("test"): Utilise application-test.properties
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("UserHealthHabitsRepository - Tests d'Intégration")
class UserHealthHabitsRepositoryTest {

    @Autowired
    private UserHealthHabitsRepository healthHabitsRepository;

    @Autowired
    private SimpleUserRepository simpleUserRepository;

    @Autowired
    private TestEntityManager entityManager;

    private SimpleUser testUser;
    private UserHealthHabits testHealthHabits;

    @BeforeEach
    void setUp() {
        // Nettoyer la base avant chaque test
        healthHabitsRepository.deleteAll();
        simpleUserRepository.deleteAll();

        // Créer un Role
        Role simpleUserRole = new Role();
        simpleUserRole.setName("SIMPLE_USER");
        entityManager.persist(simpleUserRole);

        // Créer un utilisateur de test
        testUser = new SimpleUser();
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john.doe@test.com");
        testUser.setPassword("password123");
        testUser.setPhoneNumber("1234567890");
        testUser.setAddress("123 Test St");
        testUser.setAge(30);
        testUser.setWeight(75.0f);
        testUser.setHeight(1.75f);
        testUser.setIsActive(true);
        testUser.setRole(simpleUserRole);
        testUser = simpleUserRepository.save(testUser);
        entityManager.flush();

        // Créer des habitudes de santé de test
        testHealthHabits = new UserHealthHabits();
        testHealthHabits.setUser(testUser);
        testHealthHabits.setHoursOfSleep(new BigDecimal("7.5"));
        testHealthHabits.setBedtimeHour("23:00");
        testHealthHabits.setExerciseHoursPerWeek(new BigDecimal("5.0"));
        testHealthHabits.setDailySteps(8000);
        testHealthHabits.setLitresEauJour(new BigDecimal("2.5"));
        testHealthHabits.setCafeJour(2);
        testHealthHabits.setHeuresTravailJour(new BigDecimal("8.0"));
        testHealthHabits.setJobType("Bureau");
        testHealthHabits.setActivityStatus("Actif");
        testHealthHabits.setBpSystolic(120);
        testHealthHabits.setBpDiastolic(80);
    }

    @Test
    @DisplayName("✅ findByUserId() - Devrait trouver les habitudes par ID utilisateur")
    void testFindByUserId_Success() {
        // ARRANGE - Sauvegarder dans la BD
        healthHabitsRepository.save(testHealthHabits);
        entityManager.flush();

        // ACT - Rechercher
        Optional<UserHealthHabits> result = healthHabitsRepository.findByUserId(testUser.getId());

        // ASSERT
        assertTrue(result.isPresent(), "Les habitudes devraient être trouvées");
        assertEquals(testUser.getId(), result.get().getUser().getId());
        assertEquals(new BigDecimal("7.5"), result.get().getHoursOfSleep());
        assertEquals("23:00", result.get().getBedtimeHour());
        assertEquals(8000, result.get().getDailySteps());
    }

    @Test
    @DisplayName("❌ findByUserId() - Retourner vide si utilisateur n'a pas d'habitudes")
    void testFindByUserId_NotFound() {
        // ACT - Rechercher pour un utilisateur sans habitudes
        Optional<UserHealthHabits> result = healthHabitsRepository.findByUserId(testUser.getId());

        // ASSERT
        assertFalse(result.isPresent(), "Aucune habitude ne devrait être trouvée");
    }

    @Test
    @DisplayName("✅ existsByUserId() - Devrait vérifier l'existence par ID utilisateur")
    void testExistsByUserId_True() {
        // ARRANGE
        healthHabitsRepository.save(testHealthHabits);
        entityManager.flush();

        // ACT & ASSERT
        assertTrue(healthHabitsRepository.existsByUserId(testUser.getId()),
                "Les habitudes devraient exister pour cet utilisateur");
    }

    @Test
    @DisplayName("❌ existsByUserId() - Retourner false si pas d'habitudes")
    void testExistsByUserId_False() {
        // ACT & ASSERT
        assertFalse(healthHabitsRepository.existsByUserId(testUser.getId()),
                "Les habitudes ne devraient pas exister pour cet utilisateur");
    }

    @Test
    @DisplayName("✅ deleteByUserId() - Devrait supprimer les habitudes par ID utilisateur")
    void testDeleteByUserId_Success() {
        // ARRANGE
        healthHabitsRepository.save(testHealthHabits);
        entityManager.flush();
        assertTrue(healthHabitsRepository.existsByUserId(testUser.getId()));

        // ACT
        healthHabitsRepository.deleteByUserId(testUser.getId());
        entityManager.flush();

        // ASSERT
        assertFalse(healthHabitsRepository.existsByUserId(testUser.getId()),
                "Les habitudes devraient être supprimées");
    }

  

    @Test
    @DisplayName("✅ Validation - Devrait échouer si systolic <= diastolic")
    void testBloodPressureValidation() {
        // ARRANGE - Créer des habitudes avec BP invalide
        testHealthHabits.setBpSystolic(80);  // Systolic plus bas que diastolic!
        testHealthHabits.setBpDiastolic(120);

        // ACT & ASSERT
        assertFalse(testHealthHabits.isBloodPressureValid(),
                "La validation de pression artérielle devrait échouer");
    }

    @Test
    @DisplayName("✅ OneToOne Relationship - Devrait maintenir la relation avec SimpleUser")
    void testOneToOneRelationship() {
        // ACT
        UserHealthHabits saved = healthHabitsRepository.save(testHealthHabits);
        entityManager.flush();
        entityManager.clear(); // Clear cache pour forcer un fetch

        // ASSERT
        Optional<UserHealthHabits> found = healthHabitsRepository.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals(testUser.getId(), found.get().getUser().getId());
        assertEquals("john.doe@test.com", found.get().getUser().getEmail());
    }
}
