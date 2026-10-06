package com.vehicle.retrieval.repository;

import com.vehicle.retrieval.entity.OTPVerification;
import com.vehicle.retrieval.entity.enums.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OTPVerificationRepository extends JpaRepository<OTPVerification, Long> {
    Optional<OTPVerification> findTopByRequestIdAndOtpTypeOrderByCreatedAtDesc(Long requestId, OtpType otpType);
    List<OTPVerification> findByRequestId(Long requestId);
}
