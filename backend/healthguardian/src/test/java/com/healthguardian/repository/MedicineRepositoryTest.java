package com.healthguardian.repository;

import com.healthguardian.entity.Medicine;
import com.healthguardian.entity.Pharmacy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 🧪 TEST D'INTÉGRATION - MedicineRepository
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class MedicineRepositoryTest {

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Pharmacy pharmacy;

    @BeforeEach
    void setUp() {
        // Persist a Pharmacy first
        pharmacy = new Pharmacy();
        pharmacy.setPharmacyName("Test Pharmacy");
        pharmacy.setAddress("123 Test St");
        pharmacy.setEmail("pharmacy@test.com");
        pharmacy.setIs24Hours(true);
        pharmacy.setIsActive(true);
        pharmacy = entityManager.persistAndFlush(pharmacy);
    }

    @Test
    @DisplayName("✅ Should save and find medicine by ID")
    void testSaveAndFindById() {
        Medicine medicine = new Medicine();
        medicine.setName("Aspirin");
        medicine.setPrice(new BigDecimal("5.00"));
        medicine.setStock(50);
        medicine.setAvailable(true);
        medicine.setPharmacy(pharmacy);

        Medicine saved = medicineRepository.save(medicine);
        
        assertNotNull(saved.getId());
        Medicine found = medicineRepository.findById(saved.getId()).orElse(null);
        assertNotNull(found);
        assertEquals("Aspirin", found.getName());
    }

    @Test
    @DisplayName("✅ Should find medicines by Pharmacy ID")
    void testFindByPharmacyId() {
        Medicine m1 = new Medicine(null, "Med1", BigDecimal.TEN, 10, true, pharmacy, null, null);
        Medicine m2 = new Medicine(null, "Med2", BigDecimal.ONE, 5, true, pharmacy, null, null);
        
        entityManager.persist(m1);
        entityManager.persist(m2);
        entityManager.flush();

        List<Medicine> medicines = medicineRepository.findByPharmacyId(pharmacy.getId());
        assertEquals(2, medicines.size());
    }

    @Test
    @DisplayName("✅ Should find available medicines")
    void testFindByAvailable() {
        Medicine m1 = new Medicine(null, "Available Med", BigDecimal.TEN, 10, true, pharmacy, null, null);
        Medicine m2 = new Medicine(null, "Unavailable Med", BigDecimal.ONE, 5, false, pharmacy, null, null);
        
        entityManager.persist(m1);
        entityManager.persist(m2);
        entityManager.flush();

        List<Medicine> availableMeds = medicineRepository.findByAvailable(true);
        // Note: other tests might insert data, so we check if it contains our medicine
        assertTrue(availableMeds.stream().anyMatch(m -> m.getName().equals("Available Med")));
        assertFalse(availableMeds.stream().anyMatch(m -> m.getName().equals("Unavailable Med")));
    }
}
