package com.vehicle.retrieval.service;

import com.vehicle.retrieval.dto.OtpResponse;
import com.vehicle.retrieval.dto.VerifyOtpRequest;
import com.vehicle.retrieval.entity.DriverAssignment;
import com.vehicle.retrieval.entity.OTPVerification;
import com.vehicle.retrieval.entity.RetrievalRequest;
import com.vehicle.retrieval.entity.User;
import com.vehicle.retrieval.entity.enums.OtpType;
import com.vehicle.retrieval.entity.enums.RequestStatus;
import com.vehicle.retrieval.exception.BadRequestException;
import com.vehicle.retrieval.exception.ResourceNotFoundException;
import com.vehicle.retrieval.repository.DriverAssignmentRepository;
import com.vehicle.retrieval.repository.OTPVerificationRepository;
import com.vehicle.retrieval.repository.RetrievalRequestRepository;
import com.vehicle.retrieval.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OTPService {

    private final OTPVerificationRepository otpRepository;
    private final RetrievalRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final DriverAssignmentRepository assignmentRepository;

    private static final SecureRandom random = new SecureRandom();
    private static final int OTP_EXPIRATION_MINUTES = 15;
    private static final int MAX_FAILED_ATTEMPTS = 5;

    @Transactional
    public OtpResponse generateOrGetOtp(Long requestId, OtpType type) {
        RetrievalRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("RetrievalRequest", "id", requestId));

        // Find existing unverified active OTP
        OTPVerification existing = otpRepository.findTopByRequestIdAndOtpTypeOrderByCreatedAtDesc(requestId, type)
                .orElse(null);

        if (existing != null && !existing.getIsVerified() && existing.getExpiresAt().isAfter(LocalDateTime.now()) && existing.getAttempts() < MAX_FAILED_ATTEMPTS) {
            return mapToOtpResponse(existing);
        }

        // Generate new 6-digit OTP
        String code = String.format("%06d", random.nextInt(1000000));

        OTPVerification newOtp = OTPVerification.builder()
                .request(request)
                .otpType(type)
                .otpCode(code)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES))
                .attempts(0)
                .isVerified(false)
                .build();

        OTPVerification saved = otpRepository.save(newOtp);

        // Advance request status if needed
        if (type == OtpType.PICKUP && request.getStatus() == RequestStatus.ACCEPTED) {
            request.setStatus(RequestStatus.PICKUP_OTP_PENDING);
            requestRepository.save(request);
        } else if (type == OtpType.DELIVERY && (request.getStatus() == RequestStatus.IN_PROGRESS || request.getStatus() == RequestStatus.DESTINATION_REACHED)) {
            request.setStatus(RequestStatus.DELIVERY_OTP_PENDING);
            requestRepository.save(request);
        }

        return mapToOtpResponse(saved);
    }

    @Transactional(readOnly = true)
    public OtpResponse getOwnerOtp(Long requestId, String ownerEmail, OtpType type) {
        RetrievalRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("RetrievalRequest", "id", requestId));

        if (!request.getOwner().getEmail().equalsIgnoreCase(ownerEmail)) {
            throw new BadRequestException("Only the vehicle owner can view the OTP code.");
        }

        OTPVerification otp = otpRepository.findTopByRequestIdAndOtpTypeOrderByCreatedAtDesc(requestId, type)
                .orElseThrow(() -> new ResourceNotFoundException("OTP code not generated yet for request id " + requestId, "type", type));

        return mapToOtpResponse(otp);
    }

    @Transactional
    public OtpResponse verifyOtp(Long requestId, VerifyOtpRequest verifyRequest, String driverEmail) {
        RetrievalRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("RetrievalRequest", "id", requestId));

        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", driverEmail));

        DriverAssignment assignment = assignmentRepository.findByRequest(request)
                .orElseThrow(() -> new BadRequestException("No driver assignment found for this request."));

        if (!assignment.getDriver().getId().equals(driver.getId())) {
            throw new BadRequestException("Only the assigned driver can verify the OTP.");
        }

        OTPVerification otp = otpRepository.findTopByRequestIdAndOtpTypeOrderByCreatedAtDesc(requestId, verifyRequest.getOtpType())
                .orElseThrow(() -> new BadRequestException("No active OTP found. Please request the owner to generate an OTP."));

        if (otp.getIsVerified()) {
            throw new BadRequestException("This OTP has already been verified.");
        }

        if (otp.getAttempts() >= MAX_FAILED_ATTEMPTS) {
            throw new BadRequestException("Maximum OTP verification attempts exceeded. Please ask owner to generate a new OTP.");
        }

        if (LocalDateTime.now().isAfter(otp.getExpiresAt())) {
            throw new BadRequestException("OTP code has expired. Please ask the owner for a fresh OTP code.");
        }

        if (!otp.getOtpCode().equals(verifyRequest.getOtpCode().trim())) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);
            throw new BadRequestException("Invalid OTP code. " + (MAX_FAILED_ATTEMPTS - otp.getAttempts()) + " attempts remaining.");
        }

        // OTP Verified successfully!
        otp.setIsVerified(true);
        otp.setVerifiedAt(LocalDateTime.now());
        OTPVerification savedOtp = otpRepository.save(otp);

        // Update Request Status State Machine
        if (verifyRequest.getOtpType() == OtpType.PICKUP) {
            request.setStatus(RequestStatus.PICKUP_VERIFIED);
        } else if (verifyRequest.getOtpType() == OtpType.DELIVERY) {
            request.setStatus(RequestStatus.DELIVERY_VERIFIED);
        }
        requestRepository.save(request);

        return mapToOtpResponse(savedOtp);
    }

    private OtpResponse mapToOtpResponse(OTPVerification otp) {
        return OtpResponse.builder()
                .otpCode(otp.getOtpCode())
                .otpType(otp.getOtpType())
                .expiresAt(otp.getExpiresAt())
                .isVerified(otp.getIsVerified())
                .build();
    }
}
