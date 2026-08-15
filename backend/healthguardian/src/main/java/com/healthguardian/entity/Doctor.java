package com.healthguardian.entity;

import jakarta.persistence.*;
import lombok.*;


/**
 * Doctor Entity - Medical professionals who monitor patients
 * Inherits from User entity
 */
@Entity
@DiscriminatorValue("DOCTOR")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Doctor extends User {

    @Column(name = "specialty", length = 100)
    private String specialty;

    @Column(name = "license_number", unique = true, length = 50)
    private String licenseNumber;

    @Column(name = "consultation_fee")
    private Double consultationFee;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "bio", length = 1000)
    private String bio;

    // Check if doctor profile is complete
    public boolean isDoctorProfileComplete() {
        return specialty != null && licenseNumber != null
                && getPhoneNumber() != null && getAddress() != null;
    }
}