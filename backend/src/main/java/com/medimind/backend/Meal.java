package com.medimind.backend;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "meals")
@Data
@NoArgsConstructor
public class Meal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String mealType; // e.g., "breakfast", "lunch"

    @Column(nullable = false)
    private String foodItems; // e.g., "oatmeal, banana"

    private String notes;

    @Column(nullable = false)
    private LocalDateTime loggedAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}