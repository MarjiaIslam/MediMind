package com.medimind.backend.repository;

import com.medimind.backend.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    
    @Query("SELECT m FROM Medicine m WHERE m.user.id = :userId " +
           "AND m.scheduledTime >= :start AND m.scheduledTime <= :end")
    List<Medicine> findByUserIdAndScheduledTimeBetween(
        @Param("userId") Long userId, 
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end
    );
}
