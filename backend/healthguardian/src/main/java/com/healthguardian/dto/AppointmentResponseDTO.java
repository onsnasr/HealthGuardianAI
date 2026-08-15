package com.healthguardian.dto;

import com.healthguardian.entity.Appointment.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponseDTO {

    private Long id;
    private Long patientId;
    private String patientName;
    private String patientPhone;
    private String patientEmail;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String appointmentType;
    private AppointmentStatus status;
    private String reason;
    private String notes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime completedAt;
}