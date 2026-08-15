package com.healthguardian.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Doctor Profile Update
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileUpdateDTO {

    // Personal Information
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50)
    private String lastName;

    @Size(max = 20)
    private String phoneNumber;

    @Size(max = 255)
    private String address;

    // Professional Information
    @NotBlank(message = "Specialty is required")
    @Size(max = 100)
    private String specialty;

    @NotBlank(message = "License number is required")
    @Size(max = 50)
    private String licenseNumber;

    private Double consultationFee;

    private Integer yearsOfExperience;

    @Size(max = 1000)
    private String bio;
}

/**
 * DTO for Doctor Response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
class DoctorResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private String role;
    private Boolean isActive;
    private Boolean isProfileComplete;

    // Professional fields
    private String specialty;
    private String licenseNumber;
    private Double consultationFee;
    private Integer yearsOfExperience;
    private String bio;

    private String createdAt;
    private String updatedAt;
}