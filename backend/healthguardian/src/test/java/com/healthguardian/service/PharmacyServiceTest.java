package com.healthguardian.service;

import com.healthguardian.entity.Pharmacy;
import com.healthguardian.repository.PharmacyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 🧪 TEST UNITAIRE - PharmacyService
 */
@ExtendWith(MockitoExtension.class)
class PharmacyServiceTest {

    @Mock
    private PharmacyRepository pharmacyRepository;

    @InjectMocks
    private PharmacyService pharmacyService;

    private Pharmacy pharmacy;

    @BeforeEach
    void setUp() {
        pharmacy = new Pharmacy();
        pharmacy.setId(1L);
        pharmacy.setPharmacyName("Service Pharmacy");
        pharmacy.setEmail("service@test.com");
        pharmacy.setLicenseNumber("SERV-001");
        pharmacy.setIsActive(true);
    }

    @Test
    @DisplayName("✅ createPharmacy should throw exception if email exists")
    void testCreatePharmacyDuplicateEmail() {
        when(pharmacyRepository.existsByEmail("service@test.com")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> pharmacyService.createPharmacy(pharmacy));
        verify(pharmacyRepository, never()).save(any());
    }

    @Test
    @DisplayName("✅ createPharmacy should save if valid")
    void testCreatePharmacySuccess() {
        when(pharmacyRepository.existsByEmail(anyString())).thenReturn(false);
        when(pharmacyRepository.existsByLicenseNumber(anyString())).thenReturn(false);
        when(pharmacyRepository.save(any(Pharmacy.class))).thenReturn(pharmacy);

        Pharmacy created = pharmacyService.createPharmacy(pharmacy);
        assertNotNull(created);
        assertEquals("Service Pharmacy", created.getPharmacyName());
    }

    @Test
    @DisplayName("✅ togglePharmacyActivation should switch status")
    void testToggleActivation() {
        when(pharmacyRepository.findById(1L)).thenReturn(Optional.of(pharmacy));
        
        // Initial: true -> switch to false
        String msg = pharmacyService.togglePharmacyActivation(1L);
        assertFalse(pharmacy.getIsActive());
        assertTrue(msg.contains("deactivated"));

        // Switch back to true
        msg = pharmacyService.togglePharmacyActivation(1L);
        assertTrue(pharmacy.getIsActive());
        assertTrue(msg.contains("activated"));
    }
}
