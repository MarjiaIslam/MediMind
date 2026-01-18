package com.medimind.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be 3-20 characters")
    @Column(unique = true)
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Column(unique = true)
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    // Health Profile
    private double height; // in cm
    private double weight; // in kg
    private String allergies; // Comma separated
    private String conditions; // Diabetes, etc.
    private double targetWeight; // Goal weight for BMI calculation
    private int age;
    private String gender; // Male, Female, Other
    
    // Profile Settings
    @Column(length = 500000)
    private String profilePicture; // Base64 encoded image or icon name
    private String profileIcon; // Icon name like 'avatar1', 'avatar2', etc.
    private String notificationSound; // Sound file name for medicine reminders
    private boolean notificationsEnabled = true;
    
    // Daily Stats
    private int dailyCalorieGoal = 2000;
    private int waterIntake = 0; 
    private int points = 50;
    private String level = "Bronze";
    private String mood = "Neutral"; // Happy, Sad, Tired, etc.
    
    // Calculated BMI (transient - not stored)
    @Transient
    public double getBmi() {
        if (height > 0 && weight > 0) {
            return weight / ((height / 100.0) * (height / 100.0));
        }
        return 0;
    }
    
    @Transient
    public String getBmiCategory() {
        double bmi = getBmi();
        if (bmi <= 0) return "Unknown";
        if (bmi < 18.5) return "Underweight";
        if (bmi < 25) return "Normal";
        if (bmi < 30) return "Overweight";
        return "Obese";
    }
    
    @Transient
    public int getRecommendedCalories() {
        if (weight <= 0 || height <= 0 || age <= 0) return 2000;
        // Harris-Benedict formula
        double bmr;
        if ("Female".equalsIgnoreCase(gender)) {
            bmr = 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
        } else {
            bmr = 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
        }
        return (int) (bmr * 1.55); // Moderate activity level
    }
}