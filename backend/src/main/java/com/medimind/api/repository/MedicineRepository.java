package com.medimind.api.repository;

import com.medimind.api.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByUserId(Long userId);
    List<Medicine> findByUserIdAndActiveTrue(Long userId);
}