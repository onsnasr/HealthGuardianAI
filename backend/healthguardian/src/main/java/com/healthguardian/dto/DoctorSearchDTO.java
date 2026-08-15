package com.healthguardian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorSearchDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String specialty;
    private String licenseNumber;
    private Double consultationFee;
    private Integer yearsOfExperience;
    private String bio;
    private Boolean isAvailable;
}