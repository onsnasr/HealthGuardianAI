package com.healthguardian.entity;

import jakarta.persistence.*;
import lombok.*;
/*
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
 */

/**
 * SimpleUser Entity - Regular user who tracks health habits
 * Inherits from User entity
 */
@Entity
@DiscriminatorValue("SIMPLE_USER")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SimpleUser extends User {

    @Column(name = "age")
    private Integer age;

    @Column(name = "weight")
    private Float weight;

    @Column(name = "height")
    private Float height;

    @Column(name = "medical_history", length = 1000)
    private String medicalHistory;

    // OneToOne relationship with UserHealthHabits (cascade delete)
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private UserHealthHabits healthHabits;

    // Calculated BMI (Body Mass Index)
    @Transient
    public Float calculateBMI() {
        if (weight != null && height != null && height > 0) {
            return weight / (height * height);
        }
        return null;
    }

    // Check if profile is complete for full app access
    // Profile is complete when user has both basic info AND health habits
    public boolean isProfileDataComplete() {
        boolean hasBasicInfo = age != null && weight != null && height != null
                && getPhoneNumber() != null && getAddress() != null;
        boolean hasHealthHabits = healthHabits != null;
        
        return hasBasicInfo && hasHealthHabits;
    }

}
