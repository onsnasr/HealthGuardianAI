package com.healthguardian.repository;

import com.healthguardian.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Medicine entity
 */
@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    List<Medicine> findByPharmacyId(Long pharmacyId);

    List<Medicine> findByNameContainingIgnoreCase(String name);

    // Badel "IsAvailable" b "Available"
    List<Medicine> findByAvailable(Boolean available);

    // Badel "IsAvailable" b "Available"
    List<Medicine> findByPharmacyIdAndAvailable(Long pharmacyId, Boolean available);

    List<Medicine> findByPharmacyIdAndStockGreaterThan(Long pharmacyId, Integer stock);
}