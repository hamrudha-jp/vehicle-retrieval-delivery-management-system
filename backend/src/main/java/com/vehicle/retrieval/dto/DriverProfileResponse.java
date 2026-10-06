package com.vehicle.retrieval.dto;

import com.vehicle.retrieval.entity.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverProfileResponse {
    private Long id;
    private UserResponse user;
    private String licenseNumber;
    private Integer experienceYears;
    private VerificationStatus verificationStatus;
    private String rejectionReason;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
}
