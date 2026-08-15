package com.healthguardian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for authentication response (contains JWT token and user info)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private Boolean isProfileComplete;
    private String message;
    private Boolean isActive;

    public AuthResponse(String token, Long userId, String email, String firstName,
                        String lastName, String role, Boolean isProfileComplete) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.isProfileComplete = isProfileComplete;
        this.type = "Bearer";

    }
}