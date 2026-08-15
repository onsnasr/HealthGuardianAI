package com.healthguardian.controller;

import com.healthguardian.entity.Medicine;
import com.healthguardian.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping
    public ResponseEntity<List<Medicine>> getAllMedicines() {
        return ResponseEntity.ok(medicineService.getAllMedicines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(@PathVariable Long id) {
        return medicineService.getMedicineById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/pharmacy/{pharmacyId}")
    public ResponseEntity<List<Medicine>> getMedicinesByPharmacy(@PathVariable Long pharmacyId) {
        return ResponseEntity.ok(medicineService.getMedicinesByPharmacyId(pharmacyId));
    }

    @GetMapping("/pharmacy/{pharmacyId}/available")
    public ResponseEntity<List<Medicine>> getAvailableMedicinesByPharmacy(@PathVariable Long pharmacyId) {
        return ResponseEntity.ok(medicineService.getAvailableMedicinesByPharmacy(pharmacyId));
    }

    @GetMapping("/pharmacy/{pharmacyId}/in-stock")
    public ResponseEntity<List<Medicine>> getInStockMedicinesByPharmacy(@PathVariable Long pharmacyId) {
        return ResponseEntity.ok(medicineService.getInStockMedicinesByPharmacy(pharmacyId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Medicine>> searchMedicines(@RequestParam String name) {
        return ResponseEntity.ok(medicineService.searchMedicinesByName(name));
    }

    @PostMapping("/pharmacy/{pharmacyId}")
    public ResponseEntity<Medicine> createMedicine(
            @PathVariable Long pharmacyId,
            @RequestBody Medicine medicine) {
        return ResponseEntity.ok(medicineService.createMedicine(pharmacyId, medicine));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicine> updateMedicine(
            @PathVariable Long id,
            @RequestBody Medicine medicine) {
        return ResponseEntity.ok(medicineService.updateMedicine(id, medicine));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Medicine> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> stockUpdate) {
        Integer newStock = stockUpdate.get("stock");
        return ResponseEntity.ok(medicineService.updateStock(id, newStock));
    }

    @PatchMapping("/{id}/toggle-availability")
    public ResponseEntity<String> toggleMedicineAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.toggleMedicineAvailability(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.ok().build();
    }
}