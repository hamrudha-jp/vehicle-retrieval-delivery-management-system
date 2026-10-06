package com.vehicle.retrieval.dto;

import com.vehicle.retrieval.entity.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProcessPaymentRequest {
    @NotNull(message = "Request ID is required")
    private Long requestId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
