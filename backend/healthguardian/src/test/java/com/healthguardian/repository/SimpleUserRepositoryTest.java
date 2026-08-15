package com.healthguardian.repository;

import com.healthguardian.entity.SimpleUser;
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
 * 🔗 TEST D'INTÉGRATION - SimpleUserRepository
 * Tests des requêtes réelles
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("SimpleUserRepository - Tests d'Intégration")
class SimpleUserRepositoryTest {

    @Autowired
    private SimpleUserRepository simpleUserRepository;

    @Autowired
    private org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager entityManager;

    private com.healthguardian.entity.Role patientRole;

    private SimpleUser testPatient;

    @BeforeEach
    void setUp() {
        simpleUserRepository.deleteAll();

        // Créer un Role
        patientRole = new Role();
        patientRole.setName("PATIENT");
        entityManager.persist(patientRole);

        testPatient = new SimpleUser();
        testPatient.setFirstName("Jane");
        testPatient.setLastName("Patient");
        testPatient.setEmail("jane@patient.com");
        testPatient.setPassword("encoded_password");
        testPatient.setAge(30);
        testPatient.setIsProfileComplete(false);
        testPatient.setRole(patientRole); // FIX: Role required
    }

    @Test
    @DisplayName("✅ findIncompleteProfiles() - Trouver profils incomplets")
    void testFindIncompleteProfiles() {
        simpleUserRepository.save(testPatient);

        List<SimpleUser> incompleteProfiles = simpleUserRepository.findIncompleteProfiles();

        assertEquals(1, incompleteProfiles.size());
        assertFalse(incompleteProfiles.get(0).getIsProfileComplete());
    }

    @Test
    @DisplayName("✅ findByAgeRange() - Filtrer par tranche d'âge")
    void testFindByAgeRange() {
        testPatient.setAge(30);
        simpleUserRepository.save(testPatient);

        List<SimpleUser> result = simpleUserRepository.findByAgeRange(25, 35);

        assertEquals(1, result.size());
        assertEquals(30, result.get(0).getAge());
    }
}
