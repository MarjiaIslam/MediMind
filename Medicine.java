package com.medimind.api.model;

import jakarta.persistence.*;
import lombok.Data;

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
    private String time; // e.g., "10:00 AM"
    private boolean isTaken = false; // Checkbox status
}