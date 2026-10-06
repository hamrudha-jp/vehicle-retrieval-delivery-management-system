package com.vehicle.retrieval.controller;

import com.vehicle.retrieval.dto.ApiResponse;
import com.vehicle.retrieval.dto.DriverProfileResponse;
import com.vehicle.retrieval.dto.VerifyDriverRequest;
import com.vehicle.retrieval.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/drivers")
@RequiredArgsConstructor
public class AdminDriverController {

    private final DriverService driverService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<DriverProfileResponse>>> getPendingDrivers() {
        List<DriverProfileResponse> list = driverService.getPendingVerifications();
        return ResponseEntity.ok(ApiResponse.success("Fetched pending driver verification list", list));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<DriverProfileResponse>> verifyDriver(
            @PathVariable Long id,
            @Valid @RequestBody VerifyDriverRequest request) {
        DriverProfileResponse response = driverService.verifyDriver(id, request);
        return ResponseEntity.ok(ApiResponse.success("Driver profile status updated", response));
    }
}
