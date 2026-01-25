package com.medimind.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "medicines")
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // Links medicine to a specific user
    private String name; // e.g., Vitamin C
    private String dosage; // e.g., 500mg
    
    // Multiple times per day (comma-separated, e.g., "10:00,16:00,22:00")
    private String times;
    
    // Duration
    private int durationDays; // e.g., 30 days
    private LocalDate startDate;
    private LocalDate endDate;
    
    // For daily tracking - specific time slots
    @NotBlank(message = "Morning Time (time1) is mandatory and cannot be left empty")
    private String time1; // First time slot - MANDATORY
    private String time2; // Second time slot (optional)
    private String time3; // Third time slot (optional)
    
    private boolean time1Taken = false;
    private boolean time2Taken = false;
    private boolean time3Taken = false;
    
    // Legacy field for backward compatibility
    private String time;
    private boolean isTaken = false;
    
    // Track when doses were taken
    private LocalDateTime lastTakenAt;
    
    // Notes
    private String notes;
    
    // Status
    private boolean active = true;
}