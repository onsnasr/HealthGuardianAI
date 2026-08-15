package com.healthguardian.controller;

import com.healthguardian.dto.UserResponse;
import com.healthguardian.entity.Admin;
import com.healthguardian.entity.Doctor;
import com.healthguardian.service.AdminService;
import com.healthguardian.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for Admin-specific endpoints
 * Only accessible by users with ADMIN role
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AdminController {

    private final UserService userService;
    private final AdminService adminService;

    /**
     * Get all users
     * GET /api/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Update admin profile
     * PUT /api/admin/profile/{id}
     */
    @PutMapping("/profile/{id}")
    public ResponseEntity<UserResponse> updateAdminProfile(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {

        UserResponse updatedUser = adminService.updateAdminProfile(id, updates);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Change admin password
     * PUT /api/admin/profile/{id}/password
     */
    @PutMapping("/profile/{id}/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> passwordData) {

        String oldPassword = passwordData.get("oldPassword");
        String newPassword = passwordData.get("newPassword");

        adminService.changePassword(id, oldPassword, newPassword);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Get admin by ID
     * GET /api/admin/profile/{id}
     */
    @GetMapping("/profile/{id}")
    public ResponseEntity<UserResponse> getAdminProfile(@PathVariable Long id) {
        UserResponse admin = adminService.getAdminById(id);
        return ResponseEntity.ok(admin);
    }

    /**
     * Get all admins
     * GET /api/admin/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<UserResponse>> getAllAdmins() {
        List<UserResponse> admins = adminService.getAllAdmins();
        return ResponseEntity.ok(admins);
    }

    /**
     * Create new Doctor account
     * POST /api/admin/doctors
     */
    @PostMapping("/doctors")
    public ResponseEntity<UserResponse> createDoctor(@RequestBody Map<String, Object> request) {
        Doctor doctor = new Doctor();
        doctor.setFirstName((String) request.get("firstName"));
        doctor.setLastName((String) request.get("lastName"));
        doctor.setEmail((String) request.get("email"));
        doctor.setSpecialty((String) request.get("specialty"));
        doctor.setLicenseNumber((String) request.get("licenseNumber"));
        doctor.setPhoneNumber((String) request.get("phoneNumber"));
        doctor.setAddress((String) request.get("clinicAddress"));

        String password = (String) request.get("password");
        UserResponse response = userService.createDoctor(doctor, password);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Create new Admin account
     * POST /api/admin/admins
     */
    @PostMapping("/admins")
    public ResponseEntity<UserResponse> createAdmin(@RequestBody Map<String, Object> request) {
        Admin admin = new Admin();
        admin.setFirstName((String) request.get("firstName"));
        admin.setLastName((String) request.get("lastName"));
        admin.setEmail((String) request.get("email"));
        admin.setDepartment((String) request.get("department"));

        String password = (String) request.get("password");
        UserResponse response = userService.createAdmin(admin, password);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Toggle user activation status (activate/deactivate)
     * PATCH /api/admin/users/{id}/toggle-activation
     */
    @PatchMapping("/users/{id}/toggle-activation")
    public ResponseEntity<Map<String, String>> toggleUserActivation(@PathVariable Long id) {
        String message = userService.toggleUserActivation(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete user (except Admin accounts)
     * DELETE /api/admin/users/{id}
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Get user by ID
     * GET /api/admin/users/{id}
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Get user by email
     * GET /api/admin/users/email/{email}
     */
    @GetMapping("/users/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        UserResponse user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }
}