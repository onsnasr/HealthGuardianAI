package com.healthguardian.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 🧪 TEST UNITAIRE - Pharmacy Entity
 */
class PharmacyTest {

    @Test
    @DisplayName("✅ Should create pharmacy with correct values")
    void testPharmacyCreation() {
        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setPharmacyName("My Pharmacy");
        pharmacy.setAddress("123 Street");
        pharmacy.setEmail("pharma@test.com");
        pharmacy.setLicenseNumber("LIC123");
        pharmacy.setIs24Hours(true);
        pharmacy.setIsActive(true);
        
        assertEquals("My Pharmacy", pharmacy.getPharmacyName());
        assertEquals("123 Street", pharmacy.getAddress());
        assertTrue(pharmacy.getIs24Hours());
        assertTrue(pharmacy.getIsActive());
    }

    @Test
    @DisplayName("✅ isPharmacyProfileComplete should return true if mandatory fields are set")
    void testProfileComplete() {
        Pharmacy pharmacy = new Pharmacy();
        assertFalse(pharmacy.isPharmacyProfileComplete());

        pharmacy.setPharmacyName("Name");
        assertFalse(pharmacy.isPharmacyProfileComplete());

        pharmacy.setAddress("Addr");
        assertFalse(pharmacy.isPharmacyProfileComplete());

        pharmacy.setPhoneNumber("123456");
        assertFalse(pharmacy.isPharmacyProfileComplete());

        pharmacy.setLicenseNumber("LIC");
        assertTrue(pharmacy.isPharmacyProfileComplete());
    }

    @Test
    @DisplayName("✅ Lifecycle callbacks should set timestamps")
    void testLifecycleCallbacks() {
        Pharmacy pharmacy = new Pharmacy();
        pharmacy.onCreate();
        
        assertNotNull(pharmacy.getCreatedAt());
        assertNotNull(pharmacy.getUpdatedAt());
        
        LocalDateTime oldUpdate = pharmacy.getUpdatedAt();
        pharmacy.onUpdate();
        assertTrue(pharmacy.getUpdatedAt().isAfter(oldUpdate) || pharmacy.getUpdatedAt().isEqual(oldUpdate));
    }
}
