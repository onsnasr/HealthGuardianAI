package com.healthguardian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for UserHealthHabits
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthHabitsResponseDTO {

    private Long id;
    private Long userId;
    
    // Habitudes de sommeil
    private BigDecimal hoursOfSleep;
    private String bedtimeHour;
    
    // Activité physique
    private BigDecimal exerciseHoursPerWeek;
    private Integer dailySteps;
    
    // Hydratation et stimulants
    private BigDecimal litresEauJour;
    private Integer cafeJour;
    
    // Travail
    private BigDecimal heuresTravailJour;
    private String jobType;
    private String activityStatus;
    
    // Données médicales
    private Integer bpSystolic;
    private Integer bpDiastolic;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
