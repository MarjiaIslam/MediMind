package com.medimind.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meals")
@CrossOrigin(origins = "http://localhost:5173")
public class MealSuggestionController {

    @Autowired
    private MealSuggestionService mealSuggestionService;

    @GetMapping("/suggestions/{userId}")
    public ResponseEntity<?> getMealSuggestions(@PathVariable Long userId) {
        try {
            User user = new User();
            user.setId(userId);
            // In real app, fetch full user from DB
            // For now, assume user is loaded with allergies/conditions

            List<MealSuggestionService.MealTemplate> suggestions = mealSuggestionService.getSuggestions(user);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}