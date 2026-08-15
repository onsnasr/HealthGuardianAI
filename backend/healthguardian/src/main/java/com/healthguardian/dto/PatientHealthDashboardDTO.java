package com.healthguardian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO pour récupérer toutes les données nécessaires pour le dashboard santé d'un patient
 * Combine les données de SimpleUser + UserHealthHabits
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientHealthDashboardDTO {

    // ==================== User Basic Info ====================
    private Long userId;
    private String patientName;
    private String patientEmail;
    private Integer age;
    private Float weight;
    private Float height;
    private Float bmi;

    // ==================== Health Habits (from UserHealthHabits) ====================
    private BigDecimal hoursOfSleep;
    private String bedtimeHour;
    private BigDecimal exerciseHoursPerWeek;
    private Integer dailySteps;
    private BigDecimal litresEauJour;
    private Integer cafeJour;
    private BigDecimal heuresTravailJour;
    private String jobType;
    private String activityStatus;
    private Integer bpSystolic;
    private Integer bpDiastolic;

    // ==================== Status Flags ====================
    private Boolean hasHealthHabits;
    private Boolean isProfileComplete;

    // ==================== Messages d'erreur ====================
    private String errorMessage;
}