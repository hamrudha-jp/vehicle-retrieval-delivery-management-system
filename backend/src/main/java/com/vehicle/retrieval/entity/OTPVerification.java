package com.vehicle.retrieval.entity;

import com.vehicle.retrieval.entity.enums.OtpType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OTPVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    private RetrievalRequest request;

    @Enumerated(EnumType.STRING)
    @Column(name = "otp_type", nullable = false, length = 20)
    private OtpType otpType;

    @Column(name = "otp_code", nullable = false, length = 100)
    private String otpCode; // 6-digit OTP stored securely

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Builder.Default
    @Column(nullable = false)
    private Integer attempts = 0;

    @Builder.Default
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
