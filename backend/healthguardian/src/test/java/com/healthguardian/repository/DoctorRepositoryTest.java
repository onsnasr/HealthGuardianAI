package com.healthguardian.repository;

import com.healthguardian.entity.Doctor;
import com.healthguardian.entity.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 🔗 TEST D'INTÉGRATION - DoctorRepository
 * 
 * 🎯 OBJECTIF: Tester les opérations avec la BASE DE DONNÉES (H2 en mémoire)
 * 
 * 💡 DIFFÉRENCE avec tests unitaires:
 * - Ici on utilise une VRAIE base de données (H2)
 * - Pas de mocks, interactions réelles avec JPA/Hibernate
 * - Teste les requêtes SQL générées par Spring Data
 * 
 * 🔧 @DataJpaTest: Configure automatiquement H2 + JPA
 * 🔧 @ActiveProfiles("test"): Utilise application-test.properties
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("DoctorRepository - Tests d'Intégration")
class DoctorRepositoryTest {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager entityManager;

    private Doctor testDoctor;

    @BeforeEach
    void setUp() {
        // Nettoyer la base avant chaque test
        doctorRepository.deleteAll();

        // Créer un Role
        Role doctorRole = new Role();
        doctorRole.setName("DOCTOR");
        entityManager.persist(doctorRole);

        // Créer un docteur de test
        testDoctor = new Doctor();
        testDoctor.setFirstName("Dr. John");
        testDoctor.setLastName("Doe");
        testDoctor.setEmail("doctor@test.com");
        testDoctor.setPassword("password123"); // FIX: Password require
        testDoctor.setSpecialty("Cardiology");
        testDoctor.setLicenseNumber("LIC123");
        testDoctor.setIsActive(true);
        testDoctor.setRole(doctorRole); // FIX: Role required
    }

    @Test
    @DisplayName("✅ findBySpecialty() - Devrait trouver docteurs par spécialité")
    void testFindBySpecialty() {
        // ARRANGE - Sauvegarder dans la BD
        doctorRepository.save(testDoctor);

        // ACT - Rechercher
        List<Doctor> result = doctorRepository.findBySpecialty("Cardiology");

        // ASSERT
        assertEquals(1, result.size());
        assertEquals("Cardiology", result.get(0).getSpecialty());
    }

    @Test
    @DisplayName("✅ findByLicenseNumber() - Devrait trouver par numéro licence")
    void testFindByLicenseNumber() {
        doctorRepository.save(testDoctor);

        Optional<Doctor> result = doctorRepository.findByLicenseNumber("LIC123");

        assertTrue(result.isPresent());
        assertEquals("Dr. John", result.get().getFirstName());
    }

    @Test
    @DisplayName("✅ existsByLicenseNumber() - Devrait vérifier existence")
    void testExistsByLicenseNumber() {
        doctorRepository.save(testDoctor);

        assertTrue(doctorRepository.existsByLicenseNumber("LIC123"));
        assertFalse(doctorRepository.existsByLicenseNumber("NOTEXIST"));
    }
}
