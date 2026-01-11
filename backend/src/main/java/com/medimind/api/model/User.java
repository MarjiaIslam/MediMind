package com.medimind.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    @Column(unique = true)
    private String username;
    @Column(unique = true)
    private String email;
    private String password;

    // Health Profile
    private double height; // in cm
    private double weight; // in kg
    private String allergies; // Comma separated
    private String conditions; // Diabetes, etc.
    
    // Daily Stats
    private int dailyCalorieGoal = 2000;
    private int waterIntake = 0; 
    private int points = 50;
    private String level = "Bronze";
    private String mood = "Neutral"; // Happy, Sad, Tired, etc.
}