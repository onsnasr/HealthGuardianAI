package com.healthguardian.repository;

import com.healthguardian.entity.DoctorAvailabilityException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DoctorAvailabilityExceptionRepository extends JpaRepository<DoctorAvailabilityException, Long> {

    /**
     * Récupère toutes les exceptions pour un docteur
     */
    List<DoctorAvailabilityException> findByDoctorIdOrderByExceptionDateDesc(Long doctorId);

    /**
     * Récupère les exceptions futures pour un docteur
     */
    @Query("SELECT e FROM DoctorAvailabilityException e WHERE e.doctor.id = :doctorId " +
            "AND (e.exceptionDate >= :today OR e.exceptionEndDate >= :today) " +
            "ORDER BY e.exceptionDate ASC")
    List<DoctorAvailabilityException> findUpcomingExceptions(
            @Param("doctorId") Long doctorId,
            @Param("today") LocalDate today
    );

    /**
     * Vérifie si une date spécifique est bloquée pour un docteur
     */
    @Query("SELECT e FROM DoctorAvailabilityException e WHERE e.doctor.id = :doctorId " +
            "AND e.isAvailable = false " +
            "AND ((e.exceptionEndDate IS NULL AND e.exceptionDate = :date) " +
            "     OR (e.exceptionEndDate IS NOT NULL AND e.exceptionDate <= :date AND e.exceptionEndDate >= :date))")
    List<DoctorAvailabilityException> findExceptionsForDate(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date
    );

    /**
     * Vérifie s'il existe des conflits de dates pour une nouvelle exception
     */
    @Query("SELECT COUNT(e) FROM DoctorAvailabilityException e WHERE e.doctor.id = :doctorId " +
            "AND ((e.exceptionEndDate IS NULL AND e.exceptionDate BETWEEN :startDate AND :endDate) " +
            "     OR (e.exceptionEndDate IS NOT NULL " +
            "         AND ((e.exceptionDate BETWEEN :startDate AND :endDate) " +
            "              OR (e.exceptionEndDate BETWEEN :startDate AND :endDate) " +
            "              OR (e.exceptionDate <= :startDate AND e.exceptionEndDate >= :endDate))))")
    long countConflictingExceptions(
            @Param("doctorId") Long doctorId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}