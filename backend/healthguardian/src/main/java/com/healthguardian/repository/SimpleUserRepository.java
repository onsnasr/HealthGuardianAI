package com.healthguardian.repository;

import com.healthguardian.entity.SimpleUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for SimpleUser entity
 */
@Repository
public interface SimpleUserRepository extends JpaRepository<SimpleUser, Long> {

    @Query("SELECT s FROM SimpleUser s WHERE s.isProfileComplete = false")
    List<SimpleUser> findIncompleteProfiles();

    @Query("SELECT s FROM SimpleUser s WHERE s.age BETWEEN :minAge AND :maxAge")
    List<SimpleUser> findByAgeRange(Integer minAge, Integer maxAge);
}