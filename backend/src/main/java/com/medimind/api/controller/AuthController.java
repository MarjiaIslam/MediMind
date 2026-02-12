package com.medimind.api.controller;

import com.medimind.api.model.User;
import com.medimind.api.repository.UserRepository;
import com.medimind.api.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.HashMap;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired private UserRepository userRepository;
    @Autowired private EmailService emailService;
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
    );

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        Map<String, String> errors = new HashMap<>();
        
        // Validate full name
        if (user.getFullName() == null || user.getFullName().trim().length() < 2) {
            errors.put("fullName", "Please enter your full name");
        }
        
        // Validate email format
        if (user.getEmail() == null || !EMAIL_PATTERN.matcher(user.getEmail()).matches()) {
            errors.put("email", "Please provide a valid email address");
        }
        
        // Check username length
        if (user.getUsername() == null || user.getUsername().length() < 3) {
            errors.put("username", "Username must be at least 3 characters");
        }
        
        // Check password length
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            errors.put("password", "Password must be at least 6 characters");
        }
        
        // Check if username already exists
        if (user.getUsername() != null && userRepository.findByUsername(user.getUsername()).isPresent()) {
            errors.put("username", "Username is already taken");
        }
        
        // Check if email already exists
        if (user.getEmail() != null && userRepository.findByEmail(user.getEmail()).isPresent()) {
            errors.put("email", "An account with this email already exists");
        }
        
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }
        
        // Set default values
        user.setPoints(50);
        user.setLevel("Bronze");
        user.setDailyCalorieGoal(2000);
        user.setNotificationsEnabled(true);
        user.setEmailVerified(true); // No verification needed
        
        User savedUser = userRepository.save(user);
        
        // Return success with user data for auto-login
        Map<String, Object> response = buildUserResponse(savedUser);
        response.put("message", "Account created successfully!");
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data) {
        String identifier = data.get("identifier");
        String password = data.get("password");
        
        if (identifier == null || identifier.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username or email is required"));
        }
        
        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }
        
        var userOpt = userRepository.findByUsernameOrEmail(identifier, identifier);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "error", "Account not found. Please check your credentials or sign up."
            ));
        }
        
        User user = userOpt.get();
        
        if (!user.getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Incorrect password. Please try again."
            ));
        }
        
        return ResponseEntity.ok(buildUserResponse(user));
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        
        String emailLower = email.toLowerCase().trim();
        
        // Try to find by email first, then by username or email combination
        var userOpt = userRepository.findByEmail(emailLower);
        
        // If not found, try searching with the original case
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsernameOrEmail(emailLower, emailLower);
        }
        
        // Also try with original input in case email was stored with different case
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsernameOrEmail(email.trim(), email.trim());
        }
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "error", "No account found with this email address"
            ));
        }
        
        User user = userOpt.get();
        
        // Generate OTP
        String otp = emailService.generateVerificationCode();
        user.setResetOtp(otp);
        user.setResetOtpExpiry(System.currentTimeMillis() + 10 * 60 * 1000); // 10 minutes
        userRepository.save(user);
        
        // Send email to the user's registered email
        boolean emailSent = emailService.sendPasswordResetEmail(user.getEmail(), otp, user.getFullName());
        
        // Log the OTP for development/testing
        System.out.println("[DEV] Password reset OTP for " + user.getEmail() + ": " + otp);
        
        if (emailSent) {
            return ResponseEntity.ok(Map.of("message", "OTP sent to your email"));
        } else {
            // Return success anyway - OTP is logged to console for development
            return ResponseEntity.ok(Map.of("message", "OTP sent to your email. Check server console if email not configured."));
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String otp = data.get("otp");
        String newPassword = data.get("newPassword");
        
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        
        if (otp == null || otp.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP is required"));
        }
        
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }
        
        var userOpt = userRepository.findByEmail(email.toLowerCase().trim());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Account not found"));
        }
        
        User user = userOpt.get();
        
        // Verify OTP
        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP"));
        }
        
        // Check if OTP is expired
        if (user.getResetOtpExpiry() == null || System.currentTimeMillis() > user.getResetOtpExpiry()) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP has expired. Please request a new one."));
        }
        
        // Update password and clear OTP
        user.setPassword(newPassword);
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
    
    private Map<String, Object> buildUserResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("fullName", user.getFullName());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("emailVerified", user.isEmailVerified());
        response.put("height", user.getHeight());
        response.put("weight", user.getWeight());
        response.put("age", user.getAge());
        response.put("gender", user.getGender());
        response.put("allergies", user.getAllergies());
        response.put("conditions", user.getConditions());
        response.put("targetWeight", user.getTargetWeight());
        response.put("profilePicture", user.getProfilePicture());
        response.put("profileIcon", user.getProfileIcon());
        response.put("notificationSound", user.getNotificationSound());
        response.put("notificationsEnabled", user.isNotificationsEnabled());
        response.put("dailyCalorieGoal", user.getDailyCalorieGoal());
        response.put("waterIntake", user.getWaterIntake());
        response.put("points", user.getPoints());
        response.put("level", user.getLevel());
        response.put("mood", user.getMood());
        response.put("bmi", user.getBmi());
        response.put("bmiCategory", user.getBmiCategory());
        response.put("recommendedCalories", user.getRecommendedCalories());
        response.put("streak", user.getStreak());
        response.put("lastClaimDate", user.getLastClaimDate());
        response.put("totalWaterLogs", user.getTotalWaterLogs());
        response.put("totalMealsLogged", user.getTotalMealsLogged());
        response.put("perfectMedicineDays", user.getPerfectMedicineDays());
        response.put("perfectDays", user.getPerfectDays());
        response.put("morningLogs", user.getMorningLogs());
        response.put("eveningLogs", user.getEveningLogs());
        response.put("journalEntries", user.getJournalEntries());
        response.put("lastUsernameChange", user.getLastUsernameChange());
        return response;
    }
}
