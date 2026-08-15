package com.healthguardian.service;

import com.healthguardian.dto.HealthHabitsDTO;
import com.healthguardian.dto.HealthHabitsResponseDTO;
import com.healthguardian.entity.SimpleUser;
import com.healthguardian.entity.User;
import com.healthguardian.entity.UserHealthHabits;
import com.healthguardian.repository.SimpleUserRepository;
import com.healthguardian.repository.UserHealthHabitsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserHealthHabitsService {

    private final UserHealthHabitsRepository healthHabitsRepository;
    private final SimpleUserRepository simpleUserRepository;

    /**
     * Create or update health habits for the current authenticated user
     */
    @Transactional
    public HealthHabitsResponseDTO createOrUpdateHealthHabits(HealthHabitsDTO dto) {
        SimpleUser currentUser = getCurrentSimpleUser();
        
        // Check if health habits already exist
        UserHealthHabits healthHabits = healthHabitsRepository.findByUserId(currentUser.getId())
                .orElse(new UserHealthHabits());

        // Set/Update fields
        healthHabits.setUser(currentUser);
        healthHabits.setHoursOfSleep(dto.getHoursOfSleep());
        healthHabits.setBedtimeHour(dto.getBedtimeHour());
        healthHabits.setExerciseHoursPerWeek(dto.getExerciseHoursPerWeek());
        healthHabits.setDailySteps(dto.getDailySteps());
        healthHabits.setLitresEauJour(dto.getLitresEauJour());
        healthHabits.setCafeJour(dto.getCafeJour());
        healthHabits.setHeuresTravailJour(dto.getHeuresTravailJour());
        healthHabits.setJobType(dto.getJobType());
        healthHabits.setActivityStatus(dto.getActivityStatus());
        healthHabits.setBpSystolic(dto.getBpSystolic());
        healthHabits.setBpDiastolic(dto.getBpDiastolic());


        // Custom validation: Blood pressure
        if (healthHabits.getBpSystolic() != null && healthHabits.getBpDiastolic() != null) {
            if (healthHabits.getBpSystolic() <= healthHabits.getBpDiastolic()) {
                throw new IllegalArgumentException("BP_SYSTOLIC_MUST_BE_HIGHER_THAN_DIASTOLIC");
            }
        }

        UserHealthHabits saved = healthHabitsRepository.save(healthHabits);
        log.info("Health habits saved for user ID: {}", currentUser.getId());

        // Update user's profile completion status after saving health habits
        currentUser.setIsProfileComplete(currentUser.isProfileDataComplete());
        simpleUserRepository.save(currentUser);
        log.info("Updated isProfileComplete status for user ID: {} to {}", 
                currentUser.getId(), currentUser.getIsProfileComplete());

        return mapToResponseDTO(saved);
    }

    /**
     * Get health habits for the current authenticated user
     */
    @Transactional(readOnly = true)
    public HealthHabitsResponseDTO getMyHealthHabits() {
        SimpleUser currentUser = getCurrentSimpleUser();
        
        UserHealthHabits healthHabits = healthHabitsRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("HEALTH_HABITS_NOT_FOUND"));

        return mapToResponseDTO(healthHabits);
    }

    /**
     * Delete health habits for the current authenticated user
     */
    @Transactional
    public void deleteMyHealthHabits() {
        SimpleUser currentUser = getCurrentSimpleUser();
        
        if (!healthHabitsRepository.existsByUserId(currentUser.getId())) {
            throw new IllegalArgumentException("HEALTH_HABITS_NOT_FOUND");
        }

        healthHabitsRepository.deleteByUserId(currentUser.getId());
        log.info("Health habits deleted for user ID: {}", currentUser.getId());
    }

    /**
     * Check if current user has health habits
     */
    @Transactional(readOnly = true)
    public boolean hasHealthHabits() {
        SimpleUser currentUser = getCurrentSimpleUser();
        return healthHabitsRepository.existsByUserId(currentUser.getId());
    }

    // ==================== Helper Methods ====================

    /**
     * Get current authenticated SimpleUser
     */
    private SimpleUser getCurrentSimpleUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        if (!(user instanceof SimpleUser)) {
            throw new IllegalArgumentException("ONLY_SIMPLE_USERS_CAN_HAVE_HEALTH_HABITS");
        }

        return simpleUserRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("USER_NOT_FOUND"));
    }



    /**
     * Map entity to response DTO
     */
    private HealthHabitsResponseDTO mapToResponseDTO(UserHealthHabits entity) {
        return HealthHabitsResponseDTO.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .hoursOfSleep(entity.getHoursOfSleep())
                .bedtimeHour(entity.getBedtimeHour())
                .exerciseHoursPerWeek(entity.getExerciseHoursPerWeek())
                .dailySteps(entity.getDailySteps())
                .litresEauJour(entity.getLitresEauJour())
                .cafeJour(entity.getCafeJour())
                .heuresTravailJour(entity.getHeuresTravailJour())
                .jobType(entity.getJobType())
                .activityStatus(entity.getActivityStatus())
                .bpSystolic(entity.getBpSystolic())
                .bpDiastolic(entity.getBpDiastolic())

                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
