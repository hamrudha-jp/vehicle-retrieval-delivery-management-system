package com.vehicle.retrieval.dto;

import com.vehicle.retrieval.entity.enums.OtpType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpResponse {
    private String otpCode;
    private OtpType otpType;
    private LocalDateTime expiresAt;
    private Boolean isVerified;
}
