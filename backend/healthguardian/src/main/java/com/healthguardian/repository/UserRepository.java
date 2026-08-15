package com.healthguardian.repository;

import com.healthguardian.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for User entity (parent repository)
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByIsActive(Boolean isActive);

    @Query("SELECT u FROM User u WHERE u.role.name = :roleName")
    List<User> findByRoleName(String roleName);

    @Query("SELECT u FROM User u WHERE u.role.name = :roleName AND u.isActive = :isActive")
    List<User> findByRoleNameAndIsActive(String roleName, Boolean isActive);
}