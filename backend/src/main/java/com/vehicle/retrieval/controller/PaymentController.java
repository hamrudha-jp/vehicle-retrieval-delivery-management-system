package com.vehicle.retrieval.controller;

import com.vehicle.retrieval.dto.ApiResponse;
import com.vehicle.retrieval.dto.PaymentResponse;
import com.vehicle.retrieval.dto.ProcessPaymentRequest;
import com.vehicle.retrieval.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProcessPaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Payment marked as PAID successfully", response));
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByRequestId(
            @PathVariable Long requestId,
            @AuthenticationPrincipal UserDetails userDetails) {
        PaymentResponse response = paymentService.getPaymentByRequestId(requestId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Fetched payment record", response));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        List<PaymentResponse> response = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success("Fetched system payment records", response));
    }
}
