package com.vehicle.retrieval.repository;

import com.vehicle.retrieval.entity.User;
import com.vehicle.retrieval.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByOwner(User owner);
    List<Vehicle> findByOwnerId(Long ownerId);
    Optional<Vehicle> findByIdAndOwnerId(Long id, Long ownerId);
    Boolean existsByRegistrationNumber(String registrationNumber);
}
