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

    // Verification code validity duration (10 minutes)
    private static final long CODE_VALIDITY_MS = 10 * 60 * 1000;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        Map<String, String> errors = new HashMap<>();
        
        // Validate email format
        if (user.getEmail() == null || !EMAIL_PATTERN.matcher(user.getEmail()).matches()) {
            errors.put("email", "Please provide a valid email address");
        }
        
        // Validate email domain exists
        if (user.getEmail() != null && !emailService.isValidEmailDomain(user.getEmail())) {
            errors.put("email", "This email domain doesn't exist. Please use a valid email address.");
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
            errors.put("username", "Username is already taken. Please choose another one.");
        }
        
        // Check if email already exists
        if (user.getEmail() != null && userRepository.findByEmail(user.getEmail()).isPresent()) {
            errors.put("email", "An account with this email already exists.");
        }
        
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }
        
        // Generate verification code
        String verificationCode = emailService.generateVerificationCode();
        
        // Set default values
        user.setPoints(50);
        user.setLevel("Bronze");
        user.setDailyCalorieGoal(2000);
        user.setNotificationsEnabled(true);
        user.setEmailVerified(false);
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiry(System.currentTimeMillis() + CODE_VALIDITY_MS);
        
        User savedUser = userRepository.save(user);
        
        // Send verification email asynchronously
        emailService.sendVerificationEmail(user.getEmail(), verificationCode, user.getFullName());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("requiresVerification", true);
        response.put("message", "Registration successful! Please check your email for the verification code.");
        response.put("userId", savedUser.getId());
        response.put("email", savedUser.getEmail());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String code = data.get("code");
        
        if (email == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and verification code are required"));
        }
        
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Account not found"));
        }
        
        User user = userOpt.get();
        
        // Check if already verified
        if (user.isEmailVerified()) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Email is already verified. You can login now."));
        }
        
        // Check verification code
        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid verification code"));
        }
        
        // Check if code is expired
        if (user.getVerificationCodeExpiry() != null && System.currentTimeMillis() > user.getVerificationCodeExpiry()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Verification code has expired. Please request a new one."));
        }
        
        // Mark as verified
        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("success", true, "message", "Email verified successfully! You can now login."));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Account not found with this email"));
        }
        
        User user = userOpt.get();
        
        if (user.isEmailVerified()) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Email is already verified"));
        }
        
        // Generate new code
        String newCode = emailService.generateVerificationCode();
        user.setVerificationCode(newCode);
        user.setVerificationCodeExpiry(System.currentTimeMillis() + CODE_VALIDITY_MS);
        userRepository.save(user);
        
        // Send email
        emailService.sendVerificationEmail(user.getEmail(), newCode, user.getFullName());
        
        return ResponseEntity.ok(Map.of("success", true, "message", "Verification code sent! Please check your email."));
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
                "error", "Account not found. Please check your username/email or register first."
            ));
        }
        
        User user = userOpt.get();
        
        // Check if email is verified
        if (!user.isEmailVerified()) {
            // Resend verification code
            String newCode = emailService.generateVerificationCode();
            user.setVerificationCode(newCode);
            user.setVerificationCodeExpiry(System.currentTimeMillis() + CODE_VALIDITY_MS);
            userRepository.save(user);
            emailService.sendVerificationEmail(user.getEmail(), newCode, user.getFullName());
            
            return ResponseEntity.status(403).body(Map.of(
                "error", "Email not verified. A new verification code has been sent to your email.",
                "requiresVerification", true,
                "email", user.getEmail()
            ));
        }
        
        if (!user.getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Incorrect password. Please try again."
            ));
        }
        
        // Return user data with calculated fields
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
        
        return ResponseEntity.ok(response);
    }
}
