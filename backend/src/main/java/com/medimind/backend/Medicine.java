package com.medimind.backend;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "medicines")
@Data
@NoArgsConstructor
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String dosage; // e.g., "500mg"

    @Column(nullable = false)
    private String frequency; // e.g., "twice daily"

    @Column(nullable = false)
    private String timeOfDay; // e.g., "morning, evening"

    @Column(nullable = false)
    private boolean takenToday = false;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}