package com.vehicle.retrieval.dto;

import com.vehicle.retrieval.entity.enums.OtpType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VerifyOtpRequest {

    @NotBlank(message = "OTP code is required")
    @Size(min = 6, max = 6, message = "OTP code must be 6 digits")
    private String otpCode;

    @NotNull(message = "OTP type is required (PICKUP or DELIVERY)")
    private OtpType otpType;
}
