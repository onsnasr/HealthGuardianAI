package com.healthguardian.controller;

import com.healthguardian.entity.Pharmacy;
import com.healthguardian.service.PharmacyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacies")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping
    public ResponseEntity<List<Pharmacy>> getAllPharmacies() {
        return ResponseEntity.ok(pharmacyService.getAllPharmacies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pharmacy> getPharmacyById(@PathVariable Long id) {
        return pharmacyService.getPharmacyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Pharmacy> getPharmacyByEmail(@PathVariable String email) {
        return pharmacyService.getPharmacyByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/license/{licenseNumber}")
    public ResponseEntity<Pharmacy> getPharmacyByLicenseNumber(@PathVariable String licenseNumber) {
        return pharmacyService.getPharmacyByLicenseNumber(licenseNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/24hours")
    public ResponseEntity<List<Pharmacy>> get24HoursPharmacies() {
        return ResponseEntity.ok(pharmacyService.get24HoursPharmacies());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Pharmacy>> searchPharmacies(@RequestParam String name) {
        return ResponseEntity.ok(pharmacyService.searchPharmaciesByName(name));
    }

    @PostMapping
    public ResponseEntity<Pharmacy> createPharmacy(@RequestBody Pharmacy pharmacy) {
        return ResponseEntity.ok(pharmacyService.createPharmacy(pharmacy));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pharmacy> updatePharmacy(@PathVariable Long id, @RequestBody Pharmacy pharmacy) {
        return ResponseEntity.ok(pharmacyService.updatePharmacy(id, pharmacy));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<String> togglePharmacyActivation(@PathVariable Long id) {
        return ResponseEntity.ok(pharmacyService.togglePharmacyActivation(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePharmacy(@PathVariable Long id) {
        pharmacyService.deletePharmacy(id);
        return ResponseEntity.ok().build();
    }
}