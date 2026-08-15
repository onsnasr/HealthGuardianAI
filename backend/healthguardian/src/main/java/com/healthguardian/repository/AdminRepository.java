package com.healthguardian.repository;

import com.healthguardian.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Admin entity
 */
@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    List<Admin> findByIsActive(Boolean isActive);

    @Query("SELECT COUNT(a) FROM Admin a WHERE a.isActive = true")
    long countActiveAdmins();

    List<Admin> findByAccessLevel(Integer accessLevel);
}