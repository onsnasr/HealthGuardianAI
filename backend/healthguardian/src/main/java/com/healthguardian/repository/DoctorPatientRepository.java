package com.healthguardian.repository;

import com.healthguardian.entity.DoctorPatient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorPatientRepository extends JpaRepository<DoctorPatient, Long> {

    /**
     * Trouver la relation entre un docteur et un patient
     */
    Optional<DoctorPatient> findByDoctorIdAndPatientId(Long doctorId, Long patientId);

    /**
     * Vérifier si un patient est déjà un patient du docteur
     */
    boolean existsByDoctorIdAndPatientId(Long doctorId, Long patientId);

    /**
     * Récupérer tous les patients d'un docteur
     */
    @Query("SELECT dp FROM DoctorPatient dp WHERE dp.doctor.id = :doctorId AND dp.isActive = true ORDER BY dp.lastAppointmentDate DESC")
    List<DoctorPatient> findAllByDoctorId(@Param("doctorId") Long doctorId);

    /**
     * Récupérer les patients actifs d'un docteur
     */
    @Query("SELECT dp FROM DoctorPatient dp WHERE dp.doctor.id = :doctorId AND dp.isActive = true ORDER BY dp.lastAppointmentDate DESC")
    List<DoctorPatient> findActivePatientsByDoctorId(@Param("doctorId") Long doctorId);

    /**
     * Compter le nombre de patients d'un docteur
     */
    @Query("SELECT COUNT(dp) FROM DoctorPatient dp WHERE dp.doctor.id = :doctorId AND dp.isActive = true")
    Long countActivePatientsByDoctorId(@Param("doctorId") Long doctorId);

    /**
     * Rechercher des patients par nom ou email
     */
    @Query("SELECT dp FROM DoctorPatient dp WHERE dp.doctor.id = :doctorId AND dp.isActive = true " +
            "AND (LOWER(dp.patientName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(dp.patientEmail) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<DoctorPatient> searchPatients(@Param("doctorId") Long doctorId, @Param("query") String query);

    /**
     * Récupérer tous les docteurs d'un patient
     */
    @Query("SELECT dp FROM DoctorPatient dp WHERE dp.patient.id = :patientId AND dp.isActive = true ORDER BY dp.lastAppointmentDate DESC")
    List<DoctorPatient> findAllByPatientId(@Param("patientId") Long patientId);
}