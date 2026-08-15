package com.healthguardian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyScheduleDTO {
    private DoctorAvailabilityDTO monday;
    private DoctorAvailabilityDTO tuesday;
    private DoctorAvailabilityDTO wednesday;
    private DoctorAvailabilityDTO thursday;
    private DoctorAvailabilityDTO friday;
    private DoctorAvailabilityDTO saturday;
    private DoctorAvailabilityDTO sunday;
}