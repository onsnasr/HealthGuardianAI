package com.healthguardian.dto;

import com.healthguardian.entity.DoctorAvailabilityException.ExceptionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExceptionResponseDTO {
    private Long id;
    private Long doctorId;
    private LocalDate exceptionDate;
    private LocalDate exceptionEndDate;
    private String reason;
    private Boolean isAvailable;
    private ExceptionType exceptionType;
    private Integer daysCount; // Nombre de jours concernés
}