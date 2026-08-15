package com.healthguardian.repository;

import com.healthguardian.entity.Admin;
import com.healthguardian.entity.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 🔗 TEST D'INTÉGRATION - AdminRepository
 * Tests des requêtes de base de données pour les admins
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("AdminRepository - Tests d'Intégration")
class AdminRepositoryTest {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager entityManager;

    private Admin testAdmin;

    @BeforeEach
    void setUp() {
        adminRepository.deleteAll();

        // Créer un Role ADMIN
        Role adminRole = new Role();
        adminRole.setName("ADMIN");
        adminRole = entityManager.persistAndFlush(adminRole);  // FIX: Persist and get ID

        testAdmin = new Admin();
        testAdmin.setFirstName("Super");
        testAdmin.setLastName("Admin");
        testAdmin.setEmail("admin@healthguardian.com");
        testAdmin.setPassword("encoded_password");
        testAdmin.setIsActive(true);
        testAdmin.setAccessLevel(2); // Super Admin
        testAdmin.setDepartment("IT");
        testAdmin.setRole(adminRole); // FIX: Role required
    }

    @Test
    @DisplayName("✅ findByIsActive() - Trouver admins actifs")
    void testFindByIsActive() {
        adminRepository.save(testAdmin);

        List<Admin> activeAdmins = adminRepository.findByIsActive(true);

        assertEquals(1, activeAdmins.size());
        assertTrue(activeAdmins.get(0).getIsActive());
    }


}
