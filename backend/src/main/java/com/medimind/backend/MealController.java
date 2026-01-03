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

    public static class LogMealRequest {
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

    @PostMapping("/log")
    public ResponseEntity<?> logMeal(@RequestBody LogMealRequest request, @RequestParam Long userId) {
        try {
            // In a real app, fetch full user from DB
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

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Meal>> getMealHistory(@PathVariable Long userId) {
        User user = new User();
        user.setId(userId);
        List<Meal> meals = mealService.getMealHistory(user);
        return ResponseEntity.ok(meals);
    }
}