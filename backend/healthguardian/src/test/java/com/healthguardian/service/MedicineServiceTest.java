package com.healthguardian.service;

import com.healthguardian.entity.Medicine;
import com.healthguardian.entity.Pharmacy;
import com.healthguardian.repository.MedicineRepository;
import com.healthguardian.repository.PharmacyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 🧪 TEST UNITAIRE - MedicineService
 */
@ExtendWith(MockitoExtension.class)
class MedicineServiceTest {

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private PharmacyRepository pharmacyRepository;

    @InjectMocks
    private MedicineService medicineService;

    private Pharmacy pharmacy;
    private Medicine medicine;

    @BeforeEach
    void setUp() {
        pharmacy = new Pharmacy();
        pharmacy.setId(1L);
        pharmacy.setPharmacyName("Pharma Test");

        medicine = new Medicine();
        medicine.setId(1L);
        medicine.setName("Doliprane");
        medicine.setPharmacy(pharmacy);
        medicine.setStock(10);
        medicine.setAvailable(true);
    }

    @Test
    @DisplayName("✅ createMedicine should save medicine linked to pharmacy")
    void testCreateMedicine() {
        when(pharmacyRepository.findById(1L)).thenReturn(Optional.of(pharmacy));
        when(medicineRepository.save(any(Medicine.class))).thenReturn(medicine);

        Medicine created = medicineService.createMedicine(1L, new Medicine());
        
        assertNotNull(created);
        assertEquals(pharmacy, created.getPharmacy());
        verify(medicineRepository).save(any(Medicine.class));
    }

    @Test
    @DisplayName("✅ updateStock should update stock value")
    void testUpdateStock() {
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        when(medicineRepository.save(any(Medicine.class))).thenReturn(medicine);

        medicineService.updateStock(1L, 50);

        assertEquals(50, medicine.getStock());
        verify(medicineRepository).save(medicine);
    }

    @Test
    @DisplayName("✅ toggleMedicineAvailability should switch status")
    void testToggleAvailability() {
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        
        // Initial state: true
        String status = medicineService.toggleMedicineAvailability(1L);
        assertEquals("Unavailable", status);
        assertFalse(medicine.getAvailable());

        // Call again -> true
        status = medicineService.toggleMedicineAvailability(1L);
        assertEquals("Available", status);
        assertTrue(medicine.getAvailable());
    }
}
