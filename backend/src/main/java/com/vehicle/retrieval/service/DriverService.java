package com.vehicle.retrieval.service;

import com.vehicle.retrieval.dto.*;
import com.vehicle.retrieval.entity.DriverProfile;
import com.vehicle.retrieval.entity.User;
import com.vehicle.retrieval.entity.enums.Role;
import com.vehicle.retrieval.entity.enums.VerificationStatus;
import com.vehicle.retrieval.exception.BadRequestException;
import com.vehicle.retrieval.exception.ResourceNotFoundException;
import com.vehicle.retrieval.repository.DriverProfileRepository;
import com.vehicle.retrieval.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverProfileRepository driverProfileRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Transactional
    public DriverProfileResponse createOrUpdateProfile(String userEmail, DriverProfileRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        if (user.getRole() != Role.DRIVER) {
            throw new BadRequestException("Only DRIVER users can submit a driver profile");
        }

        DriverProfile profile = driverProfileRepository.findByUser(user)
                .orElse(null);

        if (profile == null) {
            if (driverProfileRepository.existsByLicenseNumber(request.getLicenseNumber())) {
                throw new BadRequestException("License number already registered by another driver!");
            }

            profile = DriverProfile.builder()
                    .user(user)
                    .licenseNumber(request.getLicenseNumber())
                    .experienceYears(request.getExperienceYears())
                    .verificationStatus(VerificationStatus.PENDING)
                    .isAvailable(true)
                    .build();
        } else {
            profile.setLicenseNumber(request.getLicenseNumber());
            profile.setExperienceYears(request.getExperienceYears());
            profile.setVerificationStatus(VerificationStatus.PENDING); // Reset to pending if updated
            profile.setRejectionReason(null);
        }

        DriverProfile saved = driverProfileRepository.save(profile);
        return mapToDriverProfileResponse(saved);
    }

    @Transactional(readOnly = true)
    public DriverProfileResponse getDriverProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        DriverProfile profile = driverProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("DriverProfile for user", "email", userEmail));

        return mapToDriverProfileResponse(profile);
    }

    @Transactional(readOnly = true)
    public List<DriverProfileResponse> getPendingVerifications() {
        return driverProfileRepository.findByVerificationStatus(VerificationStatus.PENDING).stream()
                .map(this::mapToDriverProfileResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DriverProfileResponse verifyDriver(Long profileId, VerifyDriverRequest request) {
        DriverProfile profile = driverProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("DriverProfile", "id", profileId));

        profile.setVerificationStatus(request.getStatus());
        if (request.getStatus() == VerificationStatus.REJECTED) {
            profile.setRejectionReason(request.getRejectionReason() != null ? request.getRejectionReason() : "Application rejected by Admin.");
        } else {
            profile.setRejectionReason(null);
        }

        DriverProfile saved = driverProfileRepository.save(profile);
        return mapToDriverProfileResponse(saved);
    }

    public DriverProfileResponse mapToDriverProfileResponse(DriverProfile profile) {
        return DriverProfileResponse.builder()
                .id(profile.getId())
                .user(authService.mapToUserResponse(profile.getUser()))
                .licenseNumber(profile.getLicenseNumber())
                .experienceYears(profile.getExperienceYears())
                .verificationStatus(profile.getVerificationStatus())
                .rejectionReason(profile.getRejectionReason())
                .isAvailable(profile.getIsAvailable())
                .createdAt(profile.getCreatedAt())
                .build();
    }
}
