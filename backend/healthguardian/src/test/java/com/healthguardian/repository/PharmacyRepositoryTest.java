package com.healthguardian.repository;

import com.healthguardian.entity.Pharmacy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 🧪 TEST D'INTÉGRATION - PharmacyRepository
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class PharmacyRepositoryTest {

    @Autowired
    private PharmacyRepository pharmacyRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Pharmacy pharmacy;

    @BeforeEach
    void setUp() {
        pharmacy = new Pharmacy();
        pharmacy.setPharmacyName("Repo Test Pharmacy");
        pharmacy.setAddress("456 Repo St");
        pharmacy.setEmail("repo@pharmacy.com");
        pharmacy.setLicenseNumber("REPO-123");
        pharmacy.setIs24Hours(true);
        pharmacy.setIsActive(true);
        pharmacy = entityManager.persistAndFlush(pharmacy);
    }

    @Test
    @DisplayName("✅ Should find by Email")
    void testFindByEmail() {
        Optional<Pharmacy> found = pharmacyRepository.findByEmail("repo@pharmacy.com");
        assertTrue(found.isPresent());
        assertEquals("Repo Test Pharmacy", found.get().getPharmacyName());
    }

    @Test
    @DisplayName("✅ Should check existence by License Number")
    void testExistsByLicense() {
        assertTrue(pharmacyRepository.existsByLicenseNumber("REPO-123"));
        assertFalse(pharmacyRepository.existsByLicenseNumber("INVALID"));
    }

    @Test
    @DisplayName("✅ Should find 24 Hours Pharmacies")
    void testFindByIs24Hours() {
        List<Pharmacy> list = pharmacyRepository.findByIs24Hours(true);
        assertFalse(list.isEmpty());
        assertTrue(list.stream().anyMatch(p -> p.getPharmacyName().equals("Repo Test Pharmacy")));
    }
}
