package com.vehicle.retrieval.dto;

import com.vehicle.retrieval.entity.enums.RequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusRequest {
    @NotNull(message = "New request status is required")
    private RequestStatus status;
}
