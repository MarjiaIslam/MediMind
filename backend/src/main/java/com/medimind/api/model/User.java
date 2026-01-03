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
    
    // Stats for Dashboard
    private int dailyCalorieGoal = 2000;
    private int waterIntake = 0; 
    private int points = 50;
    private String level = "Bronze";
}