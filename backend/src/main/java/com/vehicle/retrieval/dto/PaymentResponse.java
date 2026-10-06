package com.vehicle.retrieval.dto;

import com.vehicle.retrieval.entity.enums.PaymentMethod;
import com.vehicle.retrieval.entity.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long requestId;
    private Long ownerId;
    private String ownerName;
    private Double amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}
