package com.healthguardian.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 🧪 TEST UNITAIRE - Medicine Entity
 */
class MedicineTest {

    @Test
    @DisplayName("✅ Should create medicine with builder/setters")
    void testMedicineCreation() {
        Medicine medicine = new Medicine();
        medicine.setId(1L);
        medicine.setName("Paracetamol");
        medicine.setPrice(new BigDecimal("10.50"));
        medicine.setStock(100);
        medicine.setAvailable(true);
        
        assertEquals(1L, medicine.getId());
        assertEquals("Paracetamol", medicine.getName());
        assertEquals(new BigDecimal("10.50"), medicine.getPrice());
        assertEquals(100, medicine.getStock());
        assertTrue(medicine.getAvailable());
    }

    @Test
    @DisplayName("✅ isInStock should return true only when stock > 0 and available is true")
    void testIsInStock() {
        Medicine medicine = new Medicine();
        
        // Case 1: Available + Stock > 0 -> True
        medicine.setAvailable(true);
        medicine.setStock(5);
        assertTrue(medicine.isInStock());

        // Case 2: Available + Stock = 0 -> False
        medicine.setStock(0);
        assertFalse(medicine.isInStock());

        // Case 3: Not Available + Stock > 0 -> False
        medicine.setAvailable(false);
        medicine.setStock(10);
        assertFalse(medicine.isInStock());
    }

    @Test
    @DisplayName("✅ Lifecycle callbacks should set timestamps")
    void testLifecycleCallbacks() {
        Medicine medicine = new Medicine();
        medicine.onCreate();
        
        assertNotNull(medicine.getCreatedAt());
        assertNotNull(medicine.getUpdatedAt());
        
        LocalDateTime oldUpdate = medicine.getUpdatedAt();
        
        // Simulate update
        medicine.onUpdate();
        assertTrue(medicine.getUpdatedAt().isAfter(oldUpdate) || medicine.getUpdatedAt().isEqual(oldUpdate));
    }
}
