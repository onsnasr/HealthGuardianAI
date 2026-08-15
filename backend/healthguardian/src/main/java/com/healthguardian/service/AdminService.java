package com.healthguardian.service;

import com.healthguardian.dto.UserResponse;
import com.healthguardian.entity.Admin;
import com.healthguardian.entity.User;
import com.healthguardian.repository.AdminRepository;
import com.healthguardian.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for Admin-specific business logic
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Update admin profile information
     * @param id Admin ID
     * @param updates Map containing fields to update
     * @return Updated UserResponse
     */
    public UserResponse updateAdminProfile(Long id, Map<String, Object> updates) {
        // Find the admin
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));

        // Verify it's an admin
        if (!(user instanceof Admin)) {
            throw new RuntimeException("User with id " + id + " is not an admin");
        }

        Admin admin = (Admin) user;

        // Update fields if provided
        if (updates.containsKey("firstName") && updates.get("firstName") != null) {
            admin.setFirstName((String) updates.get("firstName"));
        }
        if (updates.containsKey("lastName") && updates.get("lastName") != null) {
            admin.setLastName((String) updates.get("lastName"));
        }
        if (updates.containsKey("phoneNumber")) {
            admin.setPhoneNumber((String) updates.get("phoneNumber"));
        }
        if (updates.containsKey("department")) {
            admin.setDepartment((String) updates.get("department"));
        }

        // Update timestamp
        admin.setUpdatedAt(LocalDateTime.now());

        // Save updated admin
        Admin savedAdmin = adminRepository.save(admin);

        // Return UserResponse
        return mapToUserResponse(savedAdmin);
    }

    /**
     * Get admin by ID
     * @param id Admin ID
     * @return UserResponse
     */
    @Transactional(readOnly = true)
    public UserResponse getAdminById(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));

        return mapToUserResponse(admin);
    }

    /**
     * Get all admins
     * @return List of UserResponse
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getAllAdmins() {
        List<Admin> admins = adminRepository.findAll();
        return admins.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all active admins
     * @return List of UserResponse
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getActiveAdmins() {
        List<Admin> admins = adminRepository.findByIsActive(true);
        return admins.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update admin access level
     * @param id Admin ID
     * @param accessLevel New access level (1 or 2)
     * @return Updated UserResponse
     */
    public UserResponse updateAccessLevel(Long id, Integer accessLevel) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));

        if (accessLevel != 1 && accessLevel != 2) {
            throw new IllegalArgumentException("Access level must be 1 (Standard) or 2 (Super Admin)");
        }

        admin.setAccessLevel(accessLevel);
        admin.setUpdatedAt(LocalDateTime.now());

        Admin savedAdmin = adminRepository.save(admin);
        return mapToUserResponse(savedAdmin);
    }

    /**
     * Update admin permissions
     * @param id Admin ID
     * @param permissions Map of permissions to update
     * @return Updated UserResponse
     */
    public UserResponse updatePermissions(Long id, Map<String, Boolean> permissions) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));

        if (permissions.containsKey("canManageRoles")) {
            admin.setCanManageRoles(permissions.get("canManageRoles"));
        }
        if (permissions.containsKey("canManageUsers")) {
            admin.setCanManageUsers(permissions.get("canManageUsers"));
        }
        if (permissions.containsKey("canViewAnalytics")) {
            admin.setCanViewAnalytics(permissions.get("canViewAnalytics"));
        }

        admin.setUpdatedAt(LocalDateTime.now());

        Admin savedAdmin = adminRepository.save(admin);
        return mapToUserResponse(savedAdmin);
    }

    /**
     * Change admin password
     * @param id Admin ID
     * @param oldPassword Current password
     * @param newPassword New password
     */
    public void changePassword(Long id, String oldPassword, String newPassword) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, admin.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        admin.setPassword(passwordEncoder.encode(newPassword));
        admin.setUpdatedAt(LocalDateTime.now());

        adminRepository.save(admin);
    }

    /**
     * Get count of active admins
     * @return Count of active admins
     */
    @Transactional(readOnly = true)
    public long getActiveAdminCount() {
        return adminRepository.countActiveAdmins();
    }

    /**
     * Helper method to convert Admin entity to UserResponse DTO
     * Matches the same format as UserService.mapToUserResponse
     */
    private UserResponse mapToUserResponse(Admin admin) {
        return UserResponse.builder()
                .id(admin.getId())
                .firstName(admin.getFirstName())
                .lastName(admin.getLastName())
                .email(admin.getEmail())
                .role(admin.getRole().getName())
                .isActive(admin.getIsActive())
                .isProfileComplete(admin.getIsProfileComplete())
                .createdAt(admin.getCreatedAt())
                .lastLogin(admin.getLastLogin())
                .phoneNumber(admin.getPhoneNumber())
                .address(admin.getAddress())
                // Admin-specific fields (will add these to UserResponse)
                .build();
    }
}