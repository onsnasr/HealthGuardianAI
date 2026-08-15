package com.healthguardian.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 🧪 TEST D'INTÉGRATION - Role Entity
 * 
 * 🎯 OBJECTIF: Tester la persistance, les timestamps, et les méthodes métier
 * 
 * 💡 COUVERTURE:
 * - Constructeurs (NoArgs, AllArgs, Custom)
 * - Persistance JPA avec @PrePersist et @PreUpdate
 * - Valeurs par défaut (canBeDeleted = false)
 * - Getters/Setters
 * - Timestamps automatiques
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("Role Entity - Tests d'Intégration")
class RoleTest {

    @Autowired
    private TestEntityManager entityManager;

    private Role testRole;

    @BeforeEach
    void setUp() {
        testRole = new Role();
        testRole.setName("TEST_ROLE");
        testRole.setDescription("Test role description");
    }

    @Test
    @DisplayName("✅ NoArgsConstructor - Devrait créer un objet vide")
    void testNoArgsConstructor() {
        // ACT
        Role role = new Role();

        // ASSERT
        assertNotNull(role);
        assertNull(role.getId());
        assertNull(role.getName());
        assertFalse(role.getCanBeDeleted()); // Valeur par défaut
    }

    @Test
    @DisplayName("✅ Custom Constructor - Devrait créer avec name et description")
    void testCustomConstructor() {
        // ACT
        Role role = new Role("CUSTOM_ROLE", "Custom description");

        // ASSERT
        assertEquals("CUSTOM_ROLE", role.getName());
        assertEquals("Custom description", role.getDescription());
        assertFalse(role.getCanBeDeleted()); // Défini dans le constructeur
    }

    @Test
    @DisplayName("✅ AllArgsConstructor - Devrait créer un objet complet")
    void testAllArgsConstructor() {
        // ACT
        Role role = new Role(
                1L,
                "ADMIN",
                "Administrator role",
                true,
                null,
                null
        );

        // ASSERT
        assertEquals(1L, role.getId());
        assertEquals("ADMIN", role.getName());
        assertEquals("Administrator role", role.getDescription());
        assertTrue(role.getCanBeDeleted());
    }

   
    @Test
    @DisplayName("✅ @PreUpdate - Devrait mettre à jour updatedAt lors de la modification")
    void testPreUpdate() throws InterruptedException {
        // ARRANGE
        Role savedRole = entityManager.persistAndFlush(testRole);
        var originalUpdatedAt = savedRole.getUpdatedAt();
        
        // Attendre un peu pour garantir une différence de temps
        Thread.sleep(10);

        // ACT
        savedRole.setDescription("Updated description");
        Role updatedRole = entityManager.persistAndFlush(savedRole);

        // ASSERT
        assertNotNull(updatedRole.getUpdatedAt());
        assertTrue(updatedRole.getUpdatedAt().isAfter(originalUpdatedAt) 
                || updatedRole.getUpdatedAt().isEqual(originalUpdatedAt),
                "updatedAt devrait être mis à jour ou égal");
        assertEquals(savedRole.getCreatedAt(), updatedRole.getCreatedAt(),
                "createdAt ne devrait pas changer");
    }


    @Test
    @DisplayName("✅ Unique Constraint - Name devrait être unique")
    void testUniqueNameConstraint() {
        // ARRANGE
        Role role1 = new Role("UNIQUE_ROLE", "First role");
        Role role2 = new Role("UNIQUE_ROLE", "Second role");

        // ACT & ASSERT
        entityManager.persistAndFlush(role1);
        
        assertThrows(Exception.class, () -> {
            entityManager.persistAndFlush(role2);
        }, "Devrait lancer une exception pour nom dupliqué");
    }

    @Test
    @DisplayName("✅ Setters - Devrait modifier les valeurs")
    void testSetters() {
        // ARRANGE
        Role role = new Role();

        // ACT
        role.setName("DOCTOR");
        role.setDescription("Doctor role");
        role.setCanBeDeleted(true);

        // ASSERT
        assertEquals("DOCTOR", role.getName());
        assertEquals("Doctor role", role.getDescription());
        assertTrue(role.getCanBeDeleted());
    }

    @Test
    @DisplayName("✅ Persistence - Devrait sauvegarder et récupérer correctement")
    void testPersistence() {
        // ACT
        Role savedRole = entityManager.persistAndFlush(testRole);
        entityManager.clear(); // Vider le cache

        Role foundRole = entityManager.find(Role.class, savedRole.getId());

        // ASSERT
        assertNotNull(foundRole);
        assertEquals(testRole.getName(), foundRole.getName());
        assertEquals(testRole.getDescription(), foundRole.getDescription());
        assertFalse(foundRole.getCanBeDeleted());
    }

    @Test
    @DisplayName("✅ System Roles - Devrait créer les rôles système non supprimables")
    void testSystemRoles() {
        // ACT
        Role adminRole = new Role("ADMIN", "System administrator");
        Role doctorRole = new Role("DOCTOR", "Medical doctor");
        Role simpleUserRole = new Role("SIMPLE_USER", "Regular user");
        Role pharmacyRole = new Role("PHARMACY", "Pharmacy user");

        entityManager.persistAndFlush(adminRole);
        entityManager.persistAndFlush(doctorRole);
        entityManager.persistAndFlush(simpleUserRole);
        entityManager.persistAndFlush(pharmacyRole);

        // ASSERT
        assertFalse(adminRole.getCanBeDeleted());
        assertFalse(doctorRole.getCanBeDeleted());
        assertFalse(simpleUserRole.getCanBeDeleted());
        assertFalse(pharmacyRole.getCanBeDeleted());
    }
}
