package com.vehicle.retrieval.controller;

import com.vehicle.retrieval.dto.*;
import com.vehicle.retrieval.service.RetrievalRequestService;
import com.vehicle.retrieval.service.OTPService;
import com.vehicle.retrieval.service.InspectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/requests")
@RequiredArgsConstructor
public class RetrievalRequestController {

    private final RetrievalRequestService requestService;

    @PostMapping
    public ResponseEntity<ApiResponse<RetrievalRequestResponse>> createRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateRetrievalRequest requestDto) {
        RetrievalRequestResponse response = requestService.createRequest(userDetails.getUsername(), requestDto);
        return ResponseEntity.ok(ApiResponse.success("Vehicle retrieval request created successfully", response));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<List<RetrievalRequestResponse>>> getOwnerRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<RetrievalRequestResponse> list = requestService.getOwnerRequests(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Fetched owner requests", list));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<RetrievalRequestResponse>>> getAvailableRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<RetrievalRequestResponse> list = requestService.getAvailableRequestsForDrivers(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Fetched available requests for drivers", list));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<RetrievalRequestResponse>>> getAllRequests() {
        List<RetrievalRequestResponse> list = requestService.getAllRequests();
        return ResponseEntity.ok(ApiResponse.success("Fetched all retrieval requests", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RetrievalRequestResponse>> getRequestById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        RetrievalRequestResponse response = requestService.getRequestById(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Fetched request details", response));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<RetrievalRequestResponse>> acceptRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        RetrievalRequestResponse response = requestService.acceptRequest(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Retrieval request accepted successfully", response));
    }

    private final OTPService otpService;
    private final InspectionService inspectionService;
    private final com.vehicle.retrieval.service.PricingService pricingService;

    @PostMapping("/estimate-cost")
    public ResponseEntity<ApiResponse<CostEstimateResponse>> estimateCost(@RequestBody EstimateCostRequest request) {
        CostEstimateResponse response = pricingService.calculateEstimate(request);
        return ResponseEntity.ok(ApiResponse.success("Calculated cost estimate", response));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<RetrievalRequestResponse>> updateStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateStatusRequest request) {
        RetrievalRequestResponse response = requestService.updateRequestStatus(id, request.getStatus(), userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Request status updated to " + request.getStatus(), response));
    }

    // --- OTP Endpoints ---
    @PostMapping("/{id}/otp/generate")
    public ResponseEntity<ApiResponse<OtpResponse>> generateOtp(
            @PathVariable Long id,
            @RequestParam com.vehicle.retrieval.entity.enums.OtpType type) {
        OtpResponse response = otpService.generateOrGetOtp(id, type);
        return ResponseEntity.ok(ApiResponse.success("OTP code generated", response));
    }

    @GetMapping("/{id}/otp/owner")
    public ResponseEntity<ApiResponse<OtpResponse>> getOwnerOtp(
            @PathVariable Long id,
            @RequestParam com.vehicle.retrieval.entity.enums.OtpType type,
            @AuthenticationPrincipal UserDetails userDetails) {
        OtpResponse response = otpService.getOwnerOtp(id, userDetails.getUsername(), type);
        return ResponseEntity.ok(ApiResponse.success("Fetched owner OTP code", response));
    }

    @PostMapping("/{id}/otp/verify")
    public ResponseEntity<ApiResponse<OtpResponse>> verifyOtp(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody VerifyOtpRequest request) {
        OtpResponse response = otpService.verifyOtp(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", response));
    }

    // --- Inspection Endpoints ---
    @PostMapping("/{id}/inspection")
    public ResponseEntity<ApiResponse<VehicleInspectionResponse>> submitInspection(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SubmitInspectionRequest request) {
        VehicleInspectionResponse response = inspectionService.submitInspection(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Vehicle inspection record submitted successfully", response));
    }

    @GetMapping("/{id}/inspections")
    public ResponseEntity<ApiResponse<List<VehicleInspectionResponse>>> getInspections(@PathVariable Long id) {
        List<VehicleInspectionResponse> list = inspectionService.getInspections(id);
        return ResponseEntity.ok(ApiResponse.success("Fetched vehicle inspections", list));
    }
}
