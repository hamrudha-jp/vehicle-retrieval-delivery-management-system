package com.vehicle.retrieval.service;

import com.vehicle.retrieval.dto.PaymentResponse;
import com.vehicle.retrieval.dto.ProcessPaymentRequest;
import com.vehicle.retrieval.entity.Payment;
import com.vehicle.retrieval.entity.RetrievalRequest;
import com.vehicle.retrieval.entity.User;
import com.vehicle.retrieval.entity.enums.PaymentMethod;
import com.vehicle.retrieval.entity.enums.PaymentStatus;
import com.vehicle.retrieval.entity.enums.RequestStatus;
import com.vehicle.retrieval.repository.DriverAssignmentRepository;
import com.vehicle.retrieval.repository.PaymentRepository;
import com.vehicle.retrieval.repository.RetrievalRequestRepository;
import com.vehicle.retrieval.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RetrievalRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final DriverAssignmentRepository assignmentRepository;

    /**
     * Initializes or returns pending payment record for a request.
     * Amount comes directly from request.getEstimatedCost().
     */
    @Transactional
    public Payment createPendingPaymentForRequest(RetrievalRequest request) {
        if (paymentRepository.existsByRequestId(request.getId())) {
            return paymentRepository.findByRequestId(request.getId()).orElse(null);
        }

        Double amount = request.getEstimatedCost() != null ? request.getEstimatedCost() : 300.0;

        Payment payment = Payment.builder()
                .request(request)
                .owner(request.getOwner())
                .amount(amount)
                .paymentMethod(PaymentMethod.CASH) // default placeholder until owner chooses
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        return paymentRepository.save(payment);
    }

    /**
     * Process/mark payment as PAID by request owner.
     */
    @Transactional
    public PaymentResponse processPayment(String ownerEmail, ProcessPaymentRequest requestDto) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner user not found"));

        RetrievalRequest retrievalRequest = requestRepository.findById(requestDto.getRequestId())
                .orElseThrow(() -> new RuntimeException("Retrieval request not found with ID: " + requestDto.getRequestId()));

        // Security check: Only request owner can pay
        if (!retrievalRequest.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Unauthorized: Only the request owner can complete payment for this request");
        }

        // Request must be DELIVERED
        if (retrievalRequest.getStatus() != RequestStatus.DELIVERED) {
            throw new RuntimeException("Payment can only be processed after vehicle delivery is confirmed");
        }

        Payment payment = paymentRepository.findByRequestId(retrievalRequest.getId())
                .orElseGet(() -> createPendingPaymentForRequest(retrievalRequest));

        // SECURITY: Amount is strictly enforced from request.getEstimatedCost()
        Double serverAmount = retrievalRequest.getEstimatedCost() != null ? retrievalRequest.getEstimatedCost() : 300.0;
        payment.setAmount(serverAmount);
        payment.setPaymentMethod(requestDto.getPaymentMethod());
        payment.setPaymentStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByRequestId(Long requestId, String userEmail) {
        RetrievalRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new com.vehicle.retrieval.exception.ResourceNotFoundException("RetrievalRequest", "id", requestId));

        if (userEmail != null && !userEmail.isBlank()) {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new com.vehicle.retrieval.exception.ResourceNotFoundException("User", "email", userEmail));

            boolean isOwner = req.getOwner().getId().equals(user.getId());
            boolean isAssignedDriver = assignmentRepository.findByRequest(req)
                    .map(a -> a.getDriver().getId().equals(user.getId()))
                    .orElse(false);
            boolean isAdmin = user.getRole() == com.vehicle.retrieval.entity.enums.Role.ADMIN;

            if (!isOwner && !isAssignedDriver && !isAdmin) {
                throw new org.springframework.security.access.AccessDeniedException("Unauthorized: You do not have permission to view payment details for this request.");
            }
        }

        Payment payment = paymentRepository.findByRequestId(requestId)
                .orElse(null);
        if (payment == null) {
            Double amount = req.getEstimatedCost() != null ? req.getEstimatedCost() : 300.0;
            return PaymentResponse.builder()
                    .requestId(req.getId())
                    .ownerId(req.getOwner().getId())
                    .ownerName(req.getOwner().getName())
                    .amount(amount)
                    .paymentMethod(PaymentMethod.CASH)
                    .paymentStatus(PaymentStatus.PENDING)
                    .build();
        }
        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByRequestId(Long requestId) {
        return getPaymentByRequestId(requestId, null);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PaymentResponse mapToResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .requestId(p.getRequest() != null ? p.getRequest().getId() : null)
                .ownerId(p.getOwner() != null ? p.getOwner().getId() : null)
                .ownerName(p.getOwner() != null ? p.getOwner().getName() : "Owner")
                .amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod())
                .paymentStatus(p.getPaymentStatus())
                .createdAt(p.getCreatedAt())
                .paidAt(p.getPaidAt())
                .build();
    }
}
