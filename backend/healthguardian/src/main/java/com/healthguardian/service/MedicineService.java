package com.healthguardian.service;

import com.healthguardian.entity.Medicine;
import com.healthguardian.entity.Pharmacy;
import com.healthguardian.repository.MedicineRepository;
import com.healthguardian.repository.PharmacyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final PharmacyRepository pharmacyRepository;

    @Transactional(readOnly = true)
    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Medicine> getMedicineById(Long id) {
        return medicineRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Medicine> getMedicinesByPharmacyId(Long pharmacyId) {
        return medicineRepository.findByPharmacyId(pharmacyId);
    }

    @Transactional(readOnly = true)
    public List<Medicine> searchMedicinesByName(String name) {
        return medicineRepository.findByNameContainingIgnoreCase(name);
    }

    @Transactional(readOnly = true)
    public List<Medicine> getAvailableMedicinesByPharmacy(Long pharmacyId) {
        return medicineRepository.findByPharmacyIdAndAvailable(pharmacyId, true);
    }

    @Transactional(readOnly = true)
    public List<Medicine> getInStockMedicinesByPharmacy(Long pharmacyId) {
        return medicineRepository.findByPharmacyIdAndStockGreaterThan(pharmacyId, 0);
    }

    @Transactional
    public Medicine createMedicine(Long pharmacyId, Medicine medicine) {
        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found"));
        medicine.setPharmacy(pharmacy);
        return medicineRepository.save(medicine);
    }

    @Transactional
    public Medicine updateMedicine(Long id, Medicine updatedData) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        if (updatedData.getName() != null) medicine.setName(updatedData.getName());
        if (updatedData.getPrice() != null) medicine.setPrice(updatedData.getPrice());
        if (updatedData.getStock() != null) medicine.setStock(updatedData.getStock());
        if (updatedData.getAvailable() != null) medicine.setAvailable(updatedData.getAvailable());
        return medicineRepository.save(medicine);
    }

    @Transactional
    public Medicine updateStock(Long id, Integer newStock) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        medicine.setStock(newStock);
        return medicineRepository.save(medicine);
    }

    @Transactional
    public String toggleMedicineAvailability(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        medicine.setAvailable(!medicine.getAvailable());
        medicineRepository.save(medicine);
        return medicine.getAvailable() ? "Available" : "Unavailable";
    }

    @Transactional
    public void deleteMedicine(Long id) {
        medicineRepository.deleteById(id);
    }
}