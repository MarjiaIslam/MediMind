package com.medimind.backend;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MealSuggestionService {

    // Simulated meal database (in real app, this would be from DB)
    private static final List<MealTemplate> MEAL_DATABASE = Arrays.asList(
        new MealTemplate("Oatmeal with Banana", "breakfast", Arrays.asList("dairy"), Arrays.asList("high-fiber")),
        new MealTemplate("Grilled Chicken Salad", "lunch", Arrays.asList("nuts"), Arrays.asList("low-carb", "high-protein")),
        new MealTemplate("Baked Salmon with Quinoa", "dinner", Arrays.asList("fish"), Arrays.asList("omega-3", "high-protein")),
        new MealTemplate("Peanut Butter Toast", "snack", Arrays.asList("peanuts", "gluten"), Arrays.asList("high-protein")),
        new MealTemplate("Vegetable Stir Fry", "dinner", Arrays.asList("soy"), Arrays.asList("vegan", "low-fat")),
        new MealTemplate("Yogurt with Berries", "snack", Arrays.asList("dairy"), Arrays.asList("probiotic", "low-sugar"))
    );

    public List<MealTemplate> getSuggestions(User user) {
        String allergies = user.getAllergies() != null ? user.getAllergies().toLowerCase() : "";
        String conditions = user.getChronicConditions() != null ? user.getChronicConditions().toLowerCase() : "";

        return MEAL_DATABASE.stream()
            .filter(meal -> !containsAllergy(meal.getAllergens(), allergies))
            .filter(meal -> isSuitableForCondition(meal.getTags(), conditions))
            .collect(Collectors.toList());
    }

    private boolean containsAllergy(List<String> allergens, String userAllergies) {
        if (userAllergies.isEmpty()) return false;
        return allergens.stream()
            .anyMatch(allergen -> userAllergies.contains(allergen.toLowerCase()));
    }

    private boolean isSuitableForCondition(List<String> tags, String userConditions) {
        // For demo: assume all meals are suitable unless user has specific needs
        // In real app, you'd map conditions → dietary needs (e.g., diabetes → low-sugar)
        return true;
    }

    // Helper class to represent meal templates
    public static class MealTemplate {
        private String name;
        private String mealType;
        private List<String> allergens;
        private List<String> tags;

        public MealTemplate(String name, String mealType, List<String> allergens, List<String> tags) {
            this.name = name;
            this.mealType = mealType;
            this.allergens = allergens;
            this.tags = tags;
        }

        // Getters
        public String getName() { return name; }
        public String getMealType() { return mealType; }
        public List<String> getAllergens() { return allergens; }
        public List<String> getTags() { return tags; }
    }
}