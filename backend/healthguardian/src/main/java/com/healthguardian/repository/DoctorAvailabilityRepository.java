package com.healthguardian.repository;

import com.healthguardian.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    List<DoctorAvailability> findByDoctorId(Long doctorId);

    List<DoctorAvailability> findByDoctorIdAndIsAvailable(Long doctorId, Boolean isAvailable);

    Optional<DoctorAvailability> findByDoctorIdAndDayOfWeek(Long doctorId, DayOfWeek dayOfWeek);

    List<DoctorAvailability> findByDoctorIdAndDayOfWeekAndIsAvailable(
            Long doctorId,
            DayOfWeek dayOfWeek,
            Boolean isAvailable
    );
}
