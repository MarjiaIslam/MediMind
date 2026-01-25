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
        private Integer calories;

        public String getMealType() { return mealType; }
        public void setMealType(String mealType) { this.mealType = mealType; }

        public String getFoodItems() { return foodItems; }
        public void setFoodItems(String foodItems) { this.foodItems = foodItems; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public Integer getCalories() { return calories; }
        public void setCalories(Integer calories) { this.calories = calories; }
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
            
            // If calories provided by user, use it; otherwise calculate based on food items
            if (request.getCalories() != null && request.getCalories() > 0) {
                meal.setCalories(request.getCalories());
            } else {
                // Auto-calculate calories based on food items
                meal.setCalories(calculateCalories(request.getFoodItems()));
            }

            Meal saved = mealService.logMeal(meal);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Calculate estimated calories from food items string
    private int calculateCalories(String foodItems) {
        if (foodItems == null || foodItems.trim().isEmpty()) {
            return 0;
        }
        
        // Simple calorie estimation based on common food keywords
        String items = foodItems.toLowerCase();
        int totalCalories = 0;
        
        // Proteins
        if (items.contains("chicken")) totalCalories += 250;
        if (items.contains("beef") || items.contains("steak")) totalCalories += 300;
        if (items.contains("fish") || items.contains("salmon") || items.contains("tuna")) totalCalories += 200;
        if (items.contains("egg")) totalCalories += 80;
        if (items.contains("tofu")) totalCalories += 120;
        if (items.contains("shrimp") || items.contains("prawn")) totalCalories += 100;
        
        // Carbs
        if (items.contains("rice")) totalCalories += 200;
        if (items.contains("bread") || items.contains("toast")) totalCalories += 80;
        if (items.contains("pasta") || items.contains("noodle")) totalCalories += 220;
        if (items.contains("potato")) totalCalories += 150;
        if (items.contains("oatmeal") || items.contains("oat")) totalCalories += 150;
        
        // Vegetables
        if (items.contains("salad")) totalCalories += 50;
        if (items.contains("broccoli") || items.contains("spinach") || items.contains("kale")) totalCalories += 30;
        if (items.contains("carrot")) totalCalories += 25;
        if (items.contains("tomato")) totalCalories += 20;
        
        // Fruits
        if (items.contains("apple") || items.contains("banana") || items.contains("orange")) totalCalories += 80;
        if (items.contains("berries") || items.contains("strawberry")) totalCalories += 50;
        
        // Dairy
        if (items.contains("milk")) totalCalories += 100;
        if (items.contains("cheese")) totalCalories += 110;
        if (items.contains("yogurt")) totalCalories += 100;
        
        // Drinks
        if (items.contains("juice")) totalCalories += 120;
        if (items.contains("coffee") || items.contains("tea")) totalCalories += 5;
        if (items.contains("soda") || items.contains("cola")) totalCalories += 140;
        
        // Snacks
        if (items.contains("cookie") || items.contains("cake")) totalCalories += 200;
        if (items.contains("chips")) totalCalories += 150;
        if (items.contains("nuts") || items.contains("almond")) totalCalories += 170;
        
        // If no match found, provide a default estimate based on meal type context
        if (totalCalories == 0) {
            totalCalories = 300; // Default estimate
        }
        
        return totalCalories;
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

    // Get calorie info for user
    @GetMapping("/calories/{userId}")
    public ResponseEntity<?> getCalorieInfo(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            List<Meal> todayMeals = mealService.getTodaysMeals(user);
            
            // Estimate calories based on food items (simple estimation)
            int consumed = 0;
            for (Meal meal : todayMeals) {
                consumed += estimateMealCalories(meal);
            }
            
            int goal = user.getRecommendedCalories();
            if (goal <= 0) goal = user.getDailyCalorieGoal();
            if (goal <= 0) goal = 2000;
            
            Map<String, Object> calorieInfo = new java.util.HashMap<>();
            calorieInfo.put("consumed", consumed);
            calorieInfo.put("remaining", Math.max(0, goal - consumed));
            calorieInfo.put("goal", goal);
            calorieInfo.put("meals", todayMeals.stream().map(m -> {
                Map<String, Object> mealInfo = new java.util.HashMap<>();
                mealInfo.put("name", m.getMealType() + ": " + m.getFoodItems());
                mealInfo.put("calories", estimateMealCalories(m));
                mealInfo.put("time", m.getLoggedAt() != null ? m.getLoggedAt().toString() : "");
                return mealInfo;
            }).collect(java.util.stream.Collectors.toList()));
            
            return ResponseEntity.ok(calorieInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    private int estimateMealCalories(Meal meal) {
        // Simple calorie estimation based on meal type and food count
        String mealType = meal.getMealType() != null ? meal.getMealType().toLowerCase() : "";
        String foodItems = meal.getFoodItems() != null ? meal.getFoodItems() : "";
        int itemCount = foodItems.isEmpty() ? 1 : foodItems.split(",").length;
        
        int baseCalories = switch (mealType) {
            case "breakfast" -> 350;
            case "lunch" -> 500;
            case "dinner" -> 600;
            case "snack" -> 150;
            default -> 300;
        };
        
        return baseCalories + (itemCount - 1) * 100;
    }
}