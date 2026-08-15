package com.healthguardian.service;

import com.healthguardian.dto.DoctorProfileUpdateDTO;
import com.healthguardian.entity.Doctor;
import com.healthguardian.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for Doctor operations
 */
@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    /**
     * Get all doctors
     */
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    /**
     * Get active doctors only
     */
    public List<Doctor> getActiveDoctors() {
        return doctorRepository.findByIsActive(true);
    }

    /**
     * Get doctor by ID
     */
    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
    }

    /**
     * Get doctors by specialty
     */
    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        return doctorRepository.findBySpecialty(specialty);
    }

    /**
     * Get doctor by license number
     */
    public Doctor getDoctorByLicenseNumber(String licenseNumber) {
        return doctorRepository.findByLicenseNumber(licenseNumber)
                .orElseThrow(() -> new RuntimeException("Doctor not found with license: " + licenseNumber));
    }

    /**
     * Update doctor profile
     */
    @Transactional
    public Doctor updateDoctorProfile(Long id, DoctorProfileUpdateDTO dto) {
        Doctor doctor = getDoctorById(id);

        // Update personal information
        doctor.setFirstName(dto.getFirstName());
        doctor.setLastName(dto.getLastName());
        doctor.setPhoneNumber(dto.getPhoneNumber());
        doctor.setAddress(dto.getAddress());

        // Update professional information
        doctor.setSpecialty(dto.getSpecialty());

        // Check if license number is being changed and if it's already taken
        if (!doctor.getLicenseNumber().equals(dto.getLicenseNumber())) {
            if (doctorRepository.existsByLicenseNumber(dto.getLicenseNumber())) {
                throw new RuntimeException("License number already exists");
            }
            doctor.setLicenseNumber(dto.getLicenseNumber());
        }

        doctor.setConsultationFee(dto.getConsultationFee());
        doctor.setYearsOfExperience(dto.getYearsOfExperience());
        doctor.setBio(dto.getBio());

        // Check if profile is complete
        doctor.setIsProfileComplete(doctor.isDoctorProfileComplete());

        return doctorRepository.save(doctor);
    }


    @Transactional
    public void deleteDoctor(long id) {
        // il faut ajouter la partie des rendez-vous !!!
        try {
            // Vérifie si le docteur existe
            if (!doctorRepository.existsById(id)) {
                throw new RuntimeException("Doctor not found with id: " + id);
            }

            // Suppression directe
            doctorRepository.deleteById(id);

        } catch (Exception e) {
            throw new RuntimeException("Error deleting doctor: " + e.getMessage());
        }
    }

    /**
     * Check if license number exists
     */
    public boolean licenseNumberExists(String licenseNumber) {
        return doctorRepository.existsByLicenseNumber(licenseNumber);
    }
}