package com.healthguardian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorPatientDTO {

    private Long id;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;

    // Informations sur le patient (optionnel, peut être null)
    private Integer patientAge;
    private String patientGender;
    private String patientBloodType;

    private Long firstAppointmentId;
    private LocalDateTime firstAppointmentDate;
    private Long lastAppointmentId;
    private LocalDateTime lastAppointmentDate;
    private Integer totalAppointments;
    private Integer completedAppointments;
    private Integer cancelledAppointments;
    private String notes;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}