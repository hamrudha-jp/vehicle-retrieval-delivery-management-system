package com.vehicle.retrieval.repository;

import com.vehicle.retrieval.entity.DriverReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverReviewRepository extends JpaRepository<DriverReview, Long> {
    Optional<DriverReview> findByRequestId(Long requestId);
    List<DriverReview> findByDriverId(Long driverId);
    List<DriverReview> findByOwnerId(Long ownerId);
    boolean existsByRequestId(Long requestId);

    @Query("SELECT AVG(r.rating) FROM DriverReview r WHERE r.driver.id = :driverId")
    Double getAverageRatingForDriver(@Param("driverId") Long driverId);
}
