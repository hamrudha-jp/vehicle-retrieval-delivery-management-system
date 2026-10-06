package com.vehicle.retrieval.dto;

import com.vehicle.retrieval.entity.enums.VerificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyDriverRequest {

    @NotNull(message = "Verification status is required (APPROVED or REJECTED)")
    private VerificationStatus status;

    private String rejectionReason;
}
