package com.healthguardian.service;

import com.healthguardian.dto.UserResponse;
import com.healthguardian.entity.*;
import com.healthguardian.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for User management and UserDetailsService implementation
 */
@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final SimpleUserRepository simpleUserRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return mapToUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return mapToUserResponse(user);
    }

    @Transactional
    public String toggleUserActivation(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Special check for Admin: prevent deactivating last active admin
        if (user instanceof Admin && user.getIsActive()) {
            long activeAdminCount = adminRepository.countActiveAdmins();
            if (activeAdminCount <= 1) {
                throw new RuntimeException("Cannot deactivate the last active admin");
            }
        }

        user.setIsActive(!user.getIsActive());
        userRepository.save(user);

        return user.getIsActive() ? "User activated successfully" : "User deactivated successfully";
    }

    @Transactional
    public UserResponse updateSimpleUserProfile(Long userId, SimpleUser updatedData) {
        SimpleUser user = simpleUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Simple user not found with id: " + userId));

        // Update basic user info
        if (updatedData.getFirstName() != null) user.setFirstName(updatedData.getFirstName());
        if (updatedData.getLastName() != null) user.setLastName(updatedData.getLastName());
        if (updatedData.getPhoneNumber() != null) user.setPhoneNumber(updatedData.getPhoneNumber());
        if (updatedData.getAddress() != null) user.setAddress(updatedData.getAddress());

        // Update SimpleUser specific fields
        if (updatedData.getAge() != null) user.setAge(updatedData.getAge());
        if (updatedData.getWeight() != null) user.setWeight(updatedData.getWeight());
        if (updatedData.getHeight() != null) user.setHeight(updatedData.getHeight());
        if (updatedData.getMedicalHistory() != null) user.setMedicalHistory(updatedData.getMedicalHistory());

        // Update profile completion status
        user.setIsProfileComplete(user.isProfileDataComplete());

        user = simpleUserRepository.save(user);
        return mapToUserResponse(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Prevent deletion of Admin accounts
        if (user instanceof Admin) {
            throw new RuntimeException("Admin accounts cannot be deleted. They can only be deactivated.");
        }

        userRepository.delete(user);
    }

    // Admin creates Doctor account
    @Transactional
    public UserResponse createDoctor(Doctor doctor, String password) {
        if (userRepository.existsByEmail(doctor.getEmail())) {
            throw new RuntimeException("Email already exists: " + doctor.getEmail());
        }

        Role doctorRole = roleService.getRoleByName("DOCTOR");
        doctor.setRole(doctorRole);
        doctor.setPassword(passwordEncoder.encode(password));
        doctor.setIsActive(true);
        doctor.setIsProfileComplete(doctor.isDoctorProfileComplete());

        doctor = doctorRepository.save(doctor);
        return mapToUserResponse(doctor);
    }

    // Admin creates new Admin account
    @Transactional
    public UserResponse createAdmin(Admin admin, String password) {
        if (userRepository.existsByEmail(admin.getEmail())) {
            throw new RuntimeException("Email already exists: " + admin.getEmail());
        }

        Role adminRole = roleService.getRoleByName("ADMIN");
        admin.setRole(adminRole);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setIsActive(true);
        admin.setIsProfileComplete(true);

        admin = adminRepository.save(admin);
        return mapToUserResponse(admin);
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .isActive(user.getIsActive())
                .isProfileComplete(user.getIsProfileComplete())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .build();

        if (user instanceof SimpleUser) {
            SimpleUser simpleUser = (SimpleUser) user;
            response.setAge(simpleUser.getAge());
            response.setWeight(simpleUser.getWeight());
            response.setHeight(simpleUser.getHeight());
            response.setBmi(simpleUser.calculateBMI());
            response.setMedicalHistory(simpleUser.getMedicalHistory());
        } else if (user instanceof Doctor) {
            Doctor doctor = (Doctor) user;
            response.setSpecialty(doctor.getSpecialty());
            response.setLicenseNumber(doctor.getLicenseNumber());
            response.setConsultationFee(doctor.getConsultationFee());
            response.setYearsOfExperience(doctor.getYearsOfExperience());
            response.setBio(doctor.getBio());
        } else if (user instanceof Admin) {
            Admin admin = (Admin) user;
            response.setDepartment(admin.getDepartment());
            response.setAccessLevel(admin.getAccessLevel());
            response.setCanManageRoles(admin.getCanManageRoles());
            response.setCanManageUsers(admin.getCanManageUsers());
            response.setCanViewAnalytics(admin.getCanViewAnalytics());
        }

        return response;
    }

}