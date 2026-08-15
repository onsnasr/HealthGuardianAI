package com.healthguardian.service;

import com.healthguardian.entity.Pharmacy;
import com.healthguardian.repository.PharmacyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for Pharmacy management
 */
@Service
@RequiredArgsConstructor
public class PharmacyService {

    private final PharmacyRepository pharmacyRepository;

    @Transactional(readOnly = true)
    public List<Pharmacy> getAllPharmacies() {
        return pharmacyRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Pharmacy> getPharmacyById(Long id) {
        return pharmacyRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Pharmacy> getPharmacyByEmail(String email) {
        return pharmacyRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public Optional<Pharmacy> getPharmacyByLicenseNumber(String licenseNumber) {
        return pharmacyRepository.findByLicenseNumber(licenseNumber);
    }

    @Transactional
    public Pharmacy createPharmacy(Pharmacy pharmacy) {
        if (pharmacyRepository.existsByEmail(pharmacy.getEmail())) {
            throw new RuntimeException("Email already exists: " + pharmacy.getEmail());
        }
        if (pharmacyRepository.existsByLicenseNumber(pharmacy.getLicenseNumber())) {
            throw new RuntimeException("License number already exists: " + pharmacy.getLicenseNumber());
        }
        return pharmacyRepository.save(pharmacy);
    }

    @Transactional
    public Pharmacy updatePharmacy(Long id, Pharmacy updatedData) {
        Pharmacy pharmacy = pharmacyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found with id: " + id));

        if (updatedData.getPharmacyName() != null) {
            pharmacy.setPharmacyName(updatedData.getPharmacyName());
        }
        if (updatedData.getAddress() != null) {
            pharmacy.setAddress(updatedData.getAddress());
        }
        if (updatedData.getPhoneNumber() != null) {
            pharmacy.setPhoneNumber(updatedData.getPhoneNumber());
        }
        if (updatedData.getOpeningHours() != null) {
            pharmacy.setOpeningHours(updatedData.getOpeningHours());
        }
        if (updatedData.getIs24Hours() != null) {
            pharmacy.setIs24Hours(updatedData.getIs24Hours());
        }
        if (updatedData.getLatitude() != null) {
            pharmacy.setLatitude(updatedData.getLatitude());
        }
        if (updatedData.getLongitude() != null) {
            pharmacy.setLongitude(updatedData.getLongitude());
        }
        if (updatedData.getEmail() != null && !updatedData.getEmail().equals(pharmacy.getEmail())) {
            if (pharmacyRepository.existsByEmail(updatedData.getEmail())) {
                throw new RuntimeException("Email already exists: " + updatedData.getEmail());
            }
            pharmacy.setEmail(updatedData.getEmail());
        }

        return pharmacyRepository.save(pharmacy);
    }

    @Transactional
    public String togglePharmacyActivation(Long id) {
        Pharmacy pharmacy = pharmacyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found with id: " + id));
        pharmacy.setIsActive(!pharmacy.getIsActive());
        pharmacyRepository.save(pharmacy);
        return pharmacy.getIsActive() ? "Pharmacy activated successfully" : "Pharmacy deactivated successfully";
    }

    @Transactional
    public void deletePharmacy(Long id) {
        if (!pharmacyRepository.existsById(id)) {
            throw new RuntimeException("Pharmacy not found with id: " + id);
        }
        pharmacyRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Pharmacy> get24HoursPharmacies() {
        return pharmacyRepository.findByIs24Hours(true);
    }

    @Transactional(readOnly = true)
    public List<Pharmacy> searchPharmaciesByName(String name) {
        return pharmacyRepository.findByPharmacyNameContainingIgnoreCase(name);
    }
}