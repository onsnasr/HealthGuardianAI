package com.healthguardian.service;

import com.healthguardian.entity.Role;
import com.healthguardian.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for Role management
 */
@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    /**
     * Get all roles
     */
    @Transactional(readOnly = true)
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    /**
     * Get role by ID
     */
    @Transactional(readOnly = true)
    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));
    }

    /**
     * Get role by name
     */
    @Transactional(readOnly = true)
    public Role getRoleByName(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Role not found: " + name));
    }

    /**
     * Create new role
     */
    @Transactional
    public Role createRole(Role role) {
        if (roleRepository.existsByName(role.getName())) {
            throw new RuntimeException("Role already exists: " + role.getName());
        }

        // New custom roles can be deleted
        role.setCanBeDeleted(true);

        return roleRepository.save(role);
    }

    /**
     * Update role
     */
    @Transactional
    public Role updateRole(Long id, Role roleDetails) {
        Role role = getRoleById(id);

        // Don't allow changing name of system roles
        if (!role.getCanBeDeleted() && !role.getName().equals(roleDetails.getName())) {
            throw new RuntimeException("Cannot change name of system role");
        }

        // Check if new name already exists (if name is being changed)
        if (!role.getName().equals(roleDetails.getName()) &&
                roleRepository.existsByName(roleDetails.getName())) {
            throw new RuntimeException("Role name already exists: " + roleDetails.getName());
        }

        role.setName(roleDetails.getName());
        role.setDescription(roleDetails.getDescription());

        return roleRepository.save(role);
    }

    /**
     * Delete role (only if canBeDeleted is true)
     */
    @Transactional
    public void deleteRole(Long id) {
        Role role = getRoleById(id);

        if (!role.getCanBeDeleted()) {
            throw new RuntimeException("Cannot delete system role: " + role.getName());
        }

        // TODO: Check if any users are assigned this role before deleting
        // You might want to add a check here to prevent deletion if users exist with this role

        roleRepository.delete(role);
    }

    /**
     * Check if role exists by name
     */
    @Transactional(readOnly = true)
    public boolean roleExists(String name) {
        return roleRepository.existsByName(name);
    }
}