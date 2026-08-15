package com.healthguardian.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Admin Entity - System administrators
 * Inherits from User entity
 * Cannot be deleted, only deactivated (if not the last active admin)
 */
@Entity
@DiscriminatorValue("ADMIN")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Admin extends User {

    @Column(name = "access_level", nullable = false)
    private Integer accessLevel = 1; // 1 = Standard Admin, 2 = Super Admin

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "can_manage_roles")
    private Boolean canManageRoles = true;

    @Column(name = "can_manage_users")
    private Boolean canManageUsers = true;

    @Column(name = "can_view_analytics")
    private Boolean canViewAnalytics = true;
}