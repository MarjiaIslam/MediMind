package com.medimind.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class MealService {

    @Autowired
    private MealRepository mealRepository;

    // 1. Log a Meal (Saves to DB)
    public Meal logMeal(Meal meal) {
        meal.setLoggedAt(LocalDateTime.now());
        return mealRepository.save(meal);
    }

    // 2. Get History (Reads from DB)
    public List<Meal> getMealHistory(User user) {
        return mealRepository.findByUserOrderByLoggedAtDesc(user);
    }

    // 3. Smart Suggestions (Logic based on allergies)
    public List<Meal> getSuggestions(User user) {
        List<Meal> suggestions = new ArrayList<>();
        
        // Safety check: handle null allergies
        String allergies = (user.getAllergies() != null) ? user.getAllergies().toLowerCase() : "";

        // Breakfast Suggestion
        if (!allergies.contains("oats")) {
            suggestions.add(createSuggestion("Healthy Oatmeal with Berries", "Breakfast"));
        } else {
            suggestions.add(createSuggestion("Greek Yogurt Parfait", "Breakfast"));
        }

        // Lunch Suggestion
        if (!allergies.contains("chicken")) {
            suggestions.add(createSuggestion("Grilled Chicken Salad", "Lunch"));
        } else {
            suggestions.add(createSuggestion("Quinoa & Vegetable Bowl", "Lunch"));
        }

        // Dinner Suggestion
        if (!allergies.contains("fish")) {
            suggestions.add(createSuggestion("Baked Salmon with Asparagus", "Dinner"));
        } else {
            suggestions.add(createSuggestion("Lentil Soup with Whole Wheat Bread", "Dinner"));
        }

        return suggestions;
    }

    // Helper method to create a temporary Meal object for the list
    private Meal createSuggestion(String foodItem, String type) {
        Meal m = new Meal();
        // MATCHING YOUR MEAL.JAVA FILE HERE:
        m.setFoodItems(foodItem); 
        m.setMealType(type);
        m.setNotes("Recommended for you");
        return m;
    }
}