package com.medimind.api.repository;

import com.medimind.api.model.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface JournalRepository extends JpaRepository<JournalEntry, Long> {
    List<JournalEntry> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT j FROM JournalEntry j WHERE j.userId = :userId AND " +
           "(LOWER(j.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.tags) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<JournalEntry> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);
    
    @Query("SELECT j FROM JournalEntry j WHERE j.userId = :userId AND " +
           "j.createdAt BETWEEN :startDate AND :endDate ORDER BY j.createdAt DESC")
    List<JournalEntry> findByDateRange(@Param("userId") Long userId, 
                                       @Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);
}
