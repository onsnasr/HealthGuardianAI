package com.healthguardian.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Pharmacy Entity - Pharmacies that provide medication stock info
 * Independent entity (no longer inherits from User)
 */
@Entity
@Table(name = "pharmacies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pharmacy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pharmacy_name", nullable = false, length = 100)
    private String pharmacyName;

    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "opening_hours", length = 100)
    private String openingHours;

    @Column(name = "license_number", unique = true, length = 50)
    private String licenseNumber;

    @Column(name = "is_24_hours", nullable = false)
    private Boolean is24Hours = false;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @OneToMany(mappedBy = "pharmacy", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Medicine> medicines = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Check if pharmacy profile is complete
    public boolean isPharmacyProfileComplete() {
        return pharmacyName != null && address != null
                && phoneNumber != null && licenseNumber != null;
    }
}