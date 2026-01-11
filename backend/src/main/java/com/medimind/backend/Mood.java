package com.medimind.backend;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "moods")
@Data
@NoArgsConstructor
public class Mood {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int moodRating;

    private String message;
    private LocalDate loggedDate;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}