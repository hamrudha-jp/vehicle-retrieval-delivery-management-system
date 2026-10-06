package com.vehicle.retrieval.repository;

import com.vehicle.retrieval.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRequestId(Long requestId);
    List<Payment> findByOwnerId(Long ownerId);
    boolean existsByRequestId(Long requestId);
}
