package com.medimind.api.controller;

import com.medimind.api.model.Meal;
import com.medimind.api.model.User;
import com.medimind.api.repository.UserRepository;
import com.medimind.api.service.MealService;
import com.medimind.api.service.MealSuggestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/meals")
@CrossOrigin(origins = "*")
public class MealController {

    @Autowired
    private MealService mealService;

    @Autowired
    private MealSuggestionService mealSuggestionService;

    @Autowired
    private UserRepository userRepository;

    public static class MealRequest {
        private String mealType;
        private String foodItems;
        private String notes;

        public String getMealType() { return mealType; }
        public void setMealType(String mealType) { this.mealType = mealType; }

        public String getFoodItems() { return foodItems; }
        public void setFoodItems(String foodItems) { this.foodItems = foodItems; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    // CREATE - Log new meal
    @PostMapping("/log")
    public ResponseEntity<?> logMeal(@RequestBody MealRequest request, @RequestParam Long userId) {
        try {
            User user = new User();
            user.setId(userId);

            Meal meal = new Meal();
            meal.setMealType(request.getMealType());
            meal.setFoodItems(request.getFoodItems());
            meal.setNotes(request.getNotes());
            meal.setUser(user);

            Meal saved = mealService.logMeal(meal);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // READ - Get meal history for user
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Meal>> getMealHistory(@PathVariable Long userId) {
        try {
            User user = new User();
            user.setId(userId);
            List<Meal> meals = mealService.getMealHistory(user);
            return ResponseEntity.ok(meals);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // READ - Get single meal by ID
    @GetMapping("/{mealId}")
    public ResponseEntity<?> getMealById(@PathVariable Long mealId) {
        try {
            Optional<Meal> meal = mealService.getMealById(mealId);
            if (meal.isPresent()) {
                return ResponseEntity.ok(meal.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // UPDATE - Update existing meal
    @PutMapping("/{mealId}")
    public ResponseEntity<?> updateMeal(@PathVariable Long mealId, @RequestBody MealRequest request) {
        try {
            Optional<Meal> updated = mealService.updateMeal(mealId, request.getMealType(), 
                                                           request.getFoodItems(), request.getNotes());
            if (updated.isPresent()) {
                return ResponseEntity.ok(updated.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE - Delete meal by ID
    @DeleteMapping("/{mealId}")
    public ResponseEntity<?> deleteMeal(@PathVariable Long mealId) {
        try {
            boolean deleted = mealService.deleteMeal(mealId);
            if (deleted) {
                return ResponseEntity.ok("Meal deleted successfully");
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // READ - Get all meals
    @GetMapping("/all")
    public ResponseEntity<List<Meal>> getAllMeals() {
        try {
            List<Meal> meals = mealService.getAllMeals();
            return ResponseEntity.ok(meals);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // SUGGESTIONS - Get available food items for selection
    @GetMapping("/suggestions/food-items")
    public ResponseEntity<List<String>> getAvailableFoodItems() {
        try {
            List<String> items = mealSuggestionService.getAvailableFoodItems();
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // SUGGESTIONS - Get available cuisines for selection
    @GetMapping("/suggestions/cuisines")
    public ResponseEntity<List<String>> getAvailableCuisines() {
        try {
            List<String> cuisines = mealSuggestionService.getAvailableCuisines();
            return ResponseEntity.ok(cuisines);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // SUGGESTIONS - Get smart meal recommendations
    @PostMapping("/suggestions/recommended")
    public ResponseEntity<?> getRecommendedMeals(
            @RequestParam Long userId,
            @RequestBody Map<String, List<String>> preferences) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            List<String> foodItems = preferences.getOrDefault("foodItems", List.of());
            List<String> cuisines = preferences.getOrDefault("cuisines", List.of());

            if (foodItems.isEmpty()) {
                return ResponseEntity.badRequest().body("At least one food item must be selected");
            }

            List<Map<String, Object>> suggestions = mealSuggestionService.getSuggestedMeals(user, foodItems, cuisines);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // SUGGESTIONS - Log a suggested meal (quick log from suggestion)
    @PostMapping("/suggestions/log")
    public ResponseEntity<?> logSuggestedMeal(
            @RequestParam Long userId,
            @RequestParam String mealName) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            Meal meal = mealSuggestionService.createMealFromSuggestion(mealName, "Selected", user);
            
            if (meal == null) {
                return ResponseEntity.badRequest().body("Meal suggestion not found");
            }

            Meal saved = mealService.logMeal(meal);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}