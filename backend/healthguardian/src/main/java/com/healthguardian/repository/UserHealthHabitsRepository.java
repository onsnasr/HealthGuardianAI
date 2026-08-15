package com.healthguardian.repository;

import com.healthguardian.entity.UserHealthHabits;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UserHealthHabitsRepository extends JpaRepository<UserHealthHabits, Long> {
    
    /**
     * Find health habits by user ID
     */
    Optional<UserHealthHabits> findByUserId(Long userId);
    
    /**
     * Check if health habits exist for a user
     */
    boolean existsByUserId(Long userId);
    
    /**
     * Delete health habits by user ID
     * @Modifying is required for DELETE/UPDATE queries
     * @Transactional ensures the operation is committed to the database
     */
    @Modifying
    @Transactional
    void deleteByUserId(Long userId);
}
