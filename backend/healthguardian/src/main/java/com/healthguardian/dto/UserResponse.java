package com.healthguardian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for user information response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private Boolean isActive;
    private Boolean isProfileComplete;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

    // Common fields for all users (from User entity)
    private String phoneNumber;
    private String address;

    // Additional fields for SimpleUser
    private Integer age;
    private Float weight;
    private Float height;
    private Float bmi;
    private String medicalHistory;

    // Additional fields for Doctor
    private String specialty;
    private String licenseNumber;
    private Double consultationFee;
    private Integer yearsOfExperience;
    private String bio;

    // Additional fields for Admin
    private String department;
    private Integer accessLevel;
    private Boolean canManageRoles;
    private Boolean canManageUsers;
    private Boolean canViewAnalytics;
}