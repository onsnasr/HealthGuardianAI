package com.healthguardian.repository;

import com.healthguardian.entity.Pharmacy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Pharmacy entity
 */
@Repository
public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {

    List<Pharmacy> findByIs24Hours(Boolean is24Hours);

    Optional<Pharmacy> findByLicenseNumber(String licenseNumber);

    Optional<Pharmacy> findByEmail(String email);

    boolean existsByLicenseNumber(String licenseNumber);

    boolean existsByEmail(String email);

    List<Pharmacy> findByIsActive(Boolean isActive);

    List<Pharmacy> findByPharmacyNameContainingIgnoreCase(String name);
}