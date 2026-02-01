package com.medimind.api.controller;

import com.medimind.api.model.User;
import com.medimind.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired private UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", user.getId());
                    response.put("fullName", user.getFullName());
                    response.put("username", user.getUsername());
                    response.put("email", user.getEmail());
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
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody User updatedUser) {
        return userRepository.findById(updatedUser.getId())
                .map(existing -> {
                    // Update basic info
                    if (updatedUser.getFullName() != null) existing.setFullName(updatedUser.getFullName());
                    if (updatedUser.getHeight() > 0) existing.setHeight(updatedUser.getHeight());
                    if (updatedUser.getWeight() > 0) existing.setWeight(updatedUser.getWeight());
                    if (updatedUser.getAge() > 0) existing.setAge(updatedUser.getAge());
                    if (updatedUser.getGender() != null) existing.setGender(updatedUser.getGender());
                    if (updatedUser.getTargetWeight() > 0) existing.setTargetWeight(updatedUser.getTargetWeight());
                    
                    // Update health info
                    existing.setAllergies(updatedUser.getAllergies());
                    existing.setConditions(updatedUser.getConditions());
                    existing.setMood(updatedUser.getMood());
                    existing.setWaterIntake(updatedUser.getWaterIntake());
                    
                    // Update streak and achievement tracking
                    if (updatedUser.getStreak() >= 0) existing.setStreak(updatedUser.getStreak());
                    if (updatedUser.getLastClaimDate() != null) existing.setLastClaimDate(updatedUser.getLastClaimDate());
                    if (updatedUser.getPoints() > 0) existing.setPoints(updatedUser.getPoints());
                    if (updatedUser.getLevel() != null) existing.setLevel(updatedUser.getLevel());
                    
                    // Update achievement tracking fields - only update if new value is greater (incremental tracking)
                    // This prevents resetting achievements when other components update user without sending these fields
                    if (updatedUser.getTotalWaterLogs() > existing.getTotalWaterLogs()) existing.setTotalWaterLogs(updatedUser.getTotalWaterLogs());
                    if (updatedUser.getTotalMealsLogged() > existing.getTotalMealsLogged()) existing.setTotalMealsLogged(updatedUser.getTotalMealsLogged());
                    if (updatedUser.getPerfectMedicineDays() > existing.getPerfectMedicineDays()) existing.setPerfectMedicineDays(updatedUser.getPerfectMedicineDays());
                    if (updatedUser.getPerfectDays() > existing.getPerfectDays()) existing.setPerfectDays(updatedUser.getPerfectDays());
                    if (updatedUser.getMorningLogs() > existing.getMorningLogs()) existing.setMorningLogs(updatedUser.getMorningLogs());
                    if (updatedUser.getEveningLogs() > existing.getEveningLogs()) existing.setEveningLogs(updatedUser.getEveningLogs());
                    if (updatedUser.getJournalEntries() > existing.getJournalEntries()) existing.setJournalEntries(updatedUser.getJournalEntries());
                    
                    // Update email if provided
                    if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
                        existing.setEmail(updatedUser.getEmail());
                    }
                    
                    // Update profile settings
                    if (updatedUser.getProfilePicture() != null) existing.setProfilePicture(updatedUser.getProfilePicture());
                    if (updatedUser.getProfileIcon() != null) existing.setProfileIcon(updatedUser.getProfileIcon());
                    if (updatedUser.getNotificationSound() != null) existing.setNotificationSound(updatedUser.getNotificationSound());
                    existing.setNotificationsEnabled(updatedUser.isNotificationsEnabled());
                    
                    // Update daily goals
                    if (updatedUser.getDailyCalorieGoal() > 0) existing.setDailyCalorieGoal(updatedUser.getDailyCalorieGoal());
                    
                    User saved = userRepository.save(existing);
                    
                    // Return with calculated fields
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", saved.getId());
                    response.put("fullName", saved.getFullName());
                    response.put("username", saved.getUsername());
                    response.put("email", saved.getEmail());
                    response.put("height", saved.getHeight());
                    response.put("weight", saved.getWeight());
                    response.put("age", saved.getAge());
                    response.put("gender", saved.getGender());
                    response.put("allergies", saved.getAllergies());
                    response.put("conditions", saved.getConditions());
                    response.put("targetWeight", saved.getTargetWeight());
                    response.put("profilePicture", saved.getProfilePicture());
                    response.put("profileIcon", saved.getProfileIcon());
                    response.put("notificationSound", saved.getNotificationSound());
                    response.put("notificationsEnabled", saved.isNotificationsEnabled());
                    response.put("dailyCalorieGoal", saved.getDailyCalorieGoal());
                    response.put("waterIntake", saved.getWaterIntake());
                    response.put("points", saved.getPoints());
                    response.put("level", saved.getLevel());
                    response.put("mood", saved.getMood());
                    response.put("bmi", saved.getBmi());
                    response.put("bmiCategory", saved.getBmiCategory());
                    response.put("recommendedCalories", saved.getRecommendedCalories());
                    response.put("streak", saved.getStreak());
                    response.put("lastClaimDate", saved.getLastClaimDate());
                    response.put("totalWaterLogs", saved.getTotalWaterLogs());
                    response.put("totalMealsLogged", saved.getTotalMealsLogged());
                    response.put("perfectMedicineDays", saved.getPerfectMedicineDays());
                    response.put("perfectDays", saved.getPerfectDays());
                    response.put("morningLogs", saved.getMorningLogs());
                    response.put("eveningLogs", saved.getEveningLogs());
                    response.put("journalEntries", saved.getJournalEntries());
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/bmi/{id}")
    public ResponseEntity<?> getBmiInfo(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    Map<String, Object> bmiInfo = new HashMap<>();
                    bmiInfo.put("bmi", Math.round(user.getBmi() * 10.0) / 10.0);
                    bmiInfo.put("category", user.getBmiCategory());
                    bmiInfo.put("recommendedCalories", user.getRecommendedCalories());
                    bmiInfo.put("currentWeight", user.getWeight());
                    bmiInfo.put("targetWeight", user.getTargetWeight());
                    bmiInfo.put("height", user.getHeight());
                    
                    // Calculate ideal weight range (BMI 18.5-24.9)
                    double heightM = user.getHeight() / 100.0;
                    double minIdealWeight = 18.5 * heightM * heightM;
                    double maxIdealWeight = 24.9 * heightM * heightM;
                    bmiInfo.put("idealWeightMin", Math.round(minIdealWeight * 10.0) / 10.0);
                    bmiInfo.put("idealWeightMax", Math.round(maxIdealWeight * 10.0) / 10.0);
                    
                    // Weight to lose/gain for healthy BMI
                    double currentWeight = user.getWeight();
                    if (currentWeight > maxIdealWeight) {
                        bmiInfo.put("weightToLose", Math.round((currentWeight - maxIdealWeight) * 10.0) / 10.0);
                        bmiInfo.put("weightToGain", 0);
                    } else if (currentWeight < minIdealWeight) {
                        bmiInfo.put("weightToLose", 0);
                        bmiInfo.put("weightToGain", Math.round((minIdealWeight - currentWeight) * 10.0) / 10.0);
                    } else {
                        bmiInfo.put("weightToLose", 0);
                        bmiInfo.put("weightToGain", 0);
                    }
                    
                    return ResponseEntity.ok(bmiInfo);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}