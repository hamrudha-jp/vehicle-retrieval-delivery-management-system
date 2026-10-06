package com.vehicle.retrieval.repository;

import com.vehicle.retrieval.entity.DriverProfile;
import com.vehicle.retrieval.entity.User;
import com.vehicle.retrieval.entity.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverProfileRepository extends JpaRepository<DriverProfile, Long> {
    Optional<DriverProfile> findByUser(User user);
    Optional<DriverProfile> findByUserId(Long userId);
    List<DriverProfile> findByVerificationStatus(VerificationStatus status);
    Boolean existsByLicenseNumber(String licenseNumber);
}
