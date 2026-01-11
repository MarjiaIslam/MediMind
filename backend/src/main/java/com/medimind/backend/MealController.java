package com.medimind.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meals")
@CrossOrigin(origins = "http://localhost:5173")
public class MealController {

    @Autowired
    private MealService mealService;

    // --- FIX 1: Log Meal now accepts userId from the URL ---
    // Matches Frontend: /api/meals/log?userId=1
    @PostMapping("/log")
    public ResponseEntity<?> logMeal(@RequestBody Meal meal, @RequestParam Long userId) {
        try {
            // Create a temporary user object with the ID
            User user = new User();
            user.setId(userId);
            
            // Link the meal to this user
            meal.setUser(user);

            Meal saved = mealService.logMeal(meal);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error logging meal: " + e.getMessage());
        }
    }

    // --- FIX 2: Get History now accepts userId from the Path ---
    // Matches Frontend: /api/meals/history/1
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Meal>> getMealHistory(@PathVariable Long userId) {
        User user = new User();
        user.setId(userId);
        
        List<Meal> meals = mealService.getMealHistory(user);
        return ResponseEntity.ok(meals);
    }

    // --- FIX 3: Get Suggestions now accepts userId from the Path ---
    // Matches Frontend: /api/meals/suggestions/1
    @GetMapping("/suggestions/{userId}")
    public ResponseEntity<List<Meal>> getSuggestions(@PathVariable Long userId) {
        User user = new User();
        user.setId(userId);

        // Assuming your service has a method for suggestions
        // If not, you might need to implement getSuggestions(user) in MealService
        List<Meal> suggestions = mealService.getSuggestions(user); 
        return ResponseEntity.ok(suggestions);
    }
}