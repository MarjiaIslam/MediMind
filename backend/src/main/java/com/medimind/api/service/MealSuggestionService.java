package com.medimind.api.service;

import com.medimind.api.model.Meal;
import com.medimind.api.model.User;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MealSuggestionService {

    // Data structure for meal suggestions
    static class MealSuggestion {
        public String name;
        public String cuisine;
        public String mainIngredient;
        public int calories;
        public String description;
        public List<String> dietaryFlags; // "diabetic-friendly", "low-sodium", "nut-free", etc.

        public MealSuggestion(String name, String cuisine, String mainIngredient, int calories, String description, List<String> dietaryFlags) {
            this.name = name;
            this.cuisine = cuisine;
            this.mainIngredient = mainIngredient;
            this.calories = calories;
            this.description = description;
            this.dietaryFlags = dietaryFlags;
        }
    }

    // Comprehensive meal database
    private static final List<MealSuggestion> mealDatabase = Arrays.asList(
            // Bangladeshi Meals
            new MealSuggestion("Kacchi Biryani", "Bangladeshi", "Proteins", 600, "Aromatic rice with mutton and spices", Arrays.asList("high-protein")),
            new MealSuggestion("Hilsa Fish Curry", "Bangladeshi", "Seafood", 350, "Bengal's famous fish curry with mustard", Arrays.asList("high-protein", "omega3")),
            new MealSuggestion("Dal Bhaat", "Bangladeshi", "Legumes", 400, "Rice with lentil curry - staple meal", Arrays.asList("vegetarian", "high-fiber")),
            new MealSuggestion("Shorshe Ilish", "Bangladeshi", "Seafood", 380, "Hilsa fish in mustard paste", Arrays.asList("high-protein", "omega3", "nut-free")),
            new MealSuggestion("Bhorta", "Bangladeshi", "Vegetables", 180, "Mashed vegetables with spices", Arrays.asList("vegetarian", "low-calorie")),

            // Indian Meals
            new MealSuggestion("Dal Tadka & Roti", "Indian", "Legumes", 350, "Lentil soup with bread", Arrays.asList("vegetarian", "high-protein")),
            new MealSuggestion("Tandoori Chicken", "Indian", "Proteins", 280, "Spiced grilled chicken breast", Arrays.asList("high-protein", "low-fat", "diabetic-friendly")),
            new MealSuggestion("Palak Paneer", "Indian", "Dairy", 320, "Spinach with cottage cheese", Arrays.asList("vegetarian", "high-calcium")),
            new MealSuggestion("Rajma & Rice", "Indian", "Legumes", 450, "Kidney beans curry with rice", Arrays.asList("vegetarian", "high-fiber")),
            new MealSuggestion("Sambar", "Indian", "Vegetables", 280, "South Indian lentil vegetable stew", Arrays.asList("vegetarian", "low-fat", "diabetic-friendly")),

            // Korean Meals
            new MealSuggestion("Bibimbap", "Korean", "Mixed", 450, "Mixed rice with veggies and egg", Arrays.asList("balanced", "high-fiber")),
            new MealSuggestion("Galbijim", "Korean", "Proteins", 380, "Steamed beef with vegetables", Arrays.asList("high-protein", "low-calorie")),
            new MealSuggestion("Kimchi Jjigae", "Korean", "Vegetables", 280, "Spicy kimchi stew with tofu", Arrays.asList("vegetarian", "probiotic", "low-calorie")),
            new MealSuggestion("Bulgogi", "Korean", "Proteins", 420, "Marinated grilled beef", Arrays.asList("high-protein", "diabetic-friendly")),
            new MealSuggestion("Tteokbokki", "Korean", "Grains", 350, "Spicy rice cakes with vegetables", Arrays.asList("vegetarian")),

            // Mexican Meals
            new MealSuggestion("Grilled Chicken Fajitas", "Mexican", "Proteins", 380, "Grilled chicken with peppers", Arrays.asList("high-protein", "low-fat")),
            new MealSuggestion("Veggie Burrito", "Mexican", "Vegetables", 420, "Bean and vegetable wrap", Arrays.asList("vegetarian", "high-fiber")),
            new MealSuggestion("Ceviche", "Mexican", "Seafood", 280, "Fresh fish with lime", Arrays.asList("high-protein", "omega3", "low-calorie")),
            new MealSuggestion("Chiles Rellenos", "Mexican", "Dairy", 350, "Stuffed peppers with cheese", Arrays.asList("vegetarian", "high-calcium")),
            new MealSuggestion("Black Bean Soup", "Mexican", "Legumes", 320, "Hearty bean soup with spices", Arrays.asList("vegetarian", "high-fiber", "low-fat")),

            // Italian Meals
            new MealSuggestion("Grilled Salmon Pasta", "Italian", "Seafood", 480, "Whole wheat pasta with salmon", Arrays.asList("high-protein", "omega3")),
            new MealSuggestion("Minestrone", "Italian", "Vegetables", 280, "Vegetable and bean soup", Arrays.asList("vegetarian", "low-fat", "diabetic-friendly")),
            new MealSuggestion("Risotto", "Italian", "Grains", 420, "Creamy rice with vegetables", Arrays.asList("vegetarian", "balanced")),
            new MealSuggestion("Eggplant Parmesan", "Italian", "Vegetables", 380, "Baked eggplant with cheese", Arrays.asList("vegetarian", "high-calcium")),
            new MealSuggestion("Pollo al Limone", "Italian", "Proteins", 320, "Lemon herb chicken", Arrays.asList("high-protein", "low-fat", "diabetic-friendly")),

            // South Asian Meals
            new MealSuggestion("Butter Chicken", "South Asian", "Proteins", 520, "Chicken in creamy tomato sauce", Arrays.asList("high-protein")),
            new MealSuggestion("Vegetable Biryani", "South Asian", "Vegetables", 480, "Fragrant rice with mixed vegetables", Arrays.asList("vegetarian", "balanced")),
            new MealSuggestion("Fish Moilee", "South Asian", "Seafood", 360, "Fish in coconut curry", Arrays.asList("high-protein", "omega3")),
            new MealSuggestion("Aloo Gobi", "South Asian", "Vegetables", 240, "Potato and cauliflower curry", Arrays.asList("vegetarian", "low-calorie")),
            new MealSuggestion("Paneer Tikka", "South Asian", "Dairy", 280, "Grilled cottage cheese skewers", Arrays.asList("vegetarian", "high-protein", "high-calcium"))
    );

    /**
     * Get smart meal suggestions based on user preferences and health profile
     */
    public List<Map<String, Object>> getSuggestedMeals(User user, List<String> selectedFoodItems, List<String> selectedCuisines) {
        List<MealSuggestion> filteredMeals = new ArrayList<>();

        // Filter meals by selected food items
        for (MealSuggestion meal : mealDatabase) {
            if (selectedFoodItems.contains(meal.mainIngredient)) {
                filteredMeals.add(meal);
            }
        }

        // Further filter by cuisines if specified
        if (!selectedCuisines.isEmpty()) {
            filteredMeals.removeIf(meal -> !selectedCuisines.contains(meal.cuisine));
        }

        // Sort by health compatibility with user profile
        filteredMeals.sort((m1, m2) -> {
            int score1 = calculateHealthScore(m1, user);
            int score2 = calculateHealthScore(m2, user);
            return Integer.compare(score2, score1); // Higher score first
        });

        // Convert to response format with allergy warnings
        List<Map<String, Object>> result = new ArrayList<>();
        for (MealSuggestion meal : filteredMeals) {
            Map<String, Object> mealMap = new HashMap<>();
            mealMap.put("name", meal.name);
            mealMap.put("cuisine", meal.cuisine);
            mealMap.put("mainIngredient", meal.mainIngredient);
            mealMap.put("calories", meal.calories);
            mealMap.put("description", meal.description);
            mealMap.put("dietaryFlags", meal.dietaryFlags);
            mealMap.put("healthScore", calculateHealthScore(meal, user));
            mealMap.put("compatibility", getCompatibilityPercentage(meal, user));
            
            // Add allergy warnings
            List<String> warnings = getAllergyWarnings(meal, user);
            mealMap.put("allergyWarnings", warnings);
            mealMap.put("hasAllergyRisk", !warnings.isEmpty());
            
            // Add health condition warnings
            List<String> healthWarnings = getHealthWarnings(meal, user);
            mealMap.put("healthWarnings", healthWarnings);
            
            result.add(mealMap);
        }

        return result;
    }

    /**
     * Check for allergy warnings
     */
    private List<String> getAllergyWarnings(MealSuggestion meal, User user) {
        List<String> warnings = new ArrayList<>();
        if (user.getAllergies() == null || user.getAllergies().isEmpty()) return warnings;
        
        String allergies = user.getAllergies().toLowerCase();
        String mealName = meal.name.toLowerCase();
        String mealDesc = meal.description.toLowerCase();
        String ingredient = meal.mainIngredient.toLowerCase();
        
        // Seafood allergies
        if ((allergies.contains("seafood") || allergies.contains("fish") || allergies.contains("shellfish")) 
            && (ingredient.equals("seafood") || mealName.contains("fish") || mealName.contains("salmon") 
                || mealName.contains("hilsa") || mealName.contains("ceviche") || mealName.contains("ilish"))) {
            warnings.add("⚠️ This dish contains seafood. You have a seafood allergy!");
        }
        
        // Prawn/Shrimp allergy
        if ((allergies.contains("prawn") || allergies.contains("shrimp"))
            && (mealName.contains("prawn") || mealName.contains("shrimp") || mealDesc.contains("prawn"))) {
            warnings.add("⚠️ This dish may contain prawns/shrimp. You have a prawn allergy!");
        }
        
        // Nut allergies
        if ((allergies.contains("nut") || allergies.contains("peanut"))
            && (mealName.contains("nut") || mealDesc.contains("nut") || mealDesc.contains("peanut"))) {
            warnings.add("⚠️ This dish may contain nuts. You have a nut allergy!");
        }
        
        // Dairy allergies
        if ((allergies.contains("dairy") || allergies.contains("milk") || allergies.contains("lactose"))
            && (ingredient.equals("dairy") || mealName.contains("cheese") || mealName.contains("paneer") 
                || mealDesc.contains("cream") || mealDesc.contains("cheese"))) {
            warnings.add("⚠️ This dish contains dairy. You have a dairy/lactose allergy!");
        }
        
        // Gluten allergies
        if ((allergies.contains("gluten") || allergies.contains("wheat"))
            && (ingredient.equals("grains") || mealName.contains("pasta") || mealName.contains("roti") 
                || mealName.contains("bread") || mealDesc.contains("wheat"))) {
            warnings.add("⚠️ This dish may contain gluten. You have a gluten allergy!");
        }
        
        // Egg allergy
        if (allergies.contains("egg") 
            && (mealName.contains("egg") || mealDesc.contains("egg"))) {
            warnings.add("⚠️ This dish contains eggs. You have an egg allergy!");
        }
        
        return warnings;
    }
    
    /**
     * Check for health condition warnings
     */
    private List<String> getHealthWarnings(MealSuggestion meal, User user) {
        List<String> warnings = new ArrayList<>();
        if (user.getConditions() == null || user.getConditions().isEmpty()) return warnings;
        
        String conditions = user.getConditions().toLowerCase();
        
        // Diabetes warnings for high calorie/carb meals
        if (conditions.contains("diabetes")) {
            if (meal.calories > 500) {
                warnings.add("⚠️ High calorie meal. Monitor your blood sugar levels.");
            }
            if (meal.mainIngredient.equals("Grains") && !meal.dietaryFlags.contains("diabetic-friendly")) {
                warnings.add("⚠️ This meal is carb-heavy. Consider portion control.");
            }
        }
        
        // Hypertension warnings
        if (conditions.contains("hypertension") || conditions.contains("high blood pressure")) {
            if (!meal.dietaryFlags.contains("low-sodium")) {
                warnings.add("💡 Consider asking for less salt/sodium in this dish.");
            }
        }
        
        // Heart disease warnings
        if (conditions.contains("heart")) {
            if (!meal.dietaryFlags.contains("low-fat") && meal.calories > 450) {
                warnings.add("💡 This meal may be high in fat. Consider a lighter option.");
            }
        }
        
        return warnings;
    }

    /**
     * Get all available food items
     */
    public List<String> getAvailableFoodItems() {
        Set<String> items = new LinkedHashSet<>();
        for (MealSuggestion meal : mealDatabase) {
            items.add(meal.mainIngredient);
        }
        return new ArrayList<>(items);
    }

    /**
     * Get all available cuisines
     */
    public List<String> getAvailableCuisines() {
        Set<String> cuisines = new LinkedHashSet<>();
        for (MealSuggestion meal : mealDatabase) {
            cuisines.add(meal.cuisine);
        }
        return new ArrayList<>(cuisines);
    }

    /**
     * Calculate health compatibility score for a meal based on user profile
     */
    private int calculateHealthScore(MealSuggestion meal, User user) {
        int score = 50; // Base score

        // Check allergies - significantly reduce score for allergen risk
        if (user.getAllergies() != null && !user.getAllergies().isEmpty()) {
            String allergies = user.getAllergies().toLowerCase();
            String ingredient = meal.mainIngredient.toLowerCase();
            String mealName = meal.name.toLowerCase();
            
            // Seafood allergy check
            if ((allergies.contains("seafood") || allergies.contains("fish") || allergies.contains("shellfish"))
                && (ingredient.equals("seafood") || mealName.contains("fish"))) {
                score -= 80;
            }
            // Dairy allergy check
            if ((allergies.contains("dairy") || allergies.contains("milk") || allergies.contains("lactose"))
                && ingredient.equals("dairy")) {
                score -= 80;
            }
            // Nut allergy check
            if ((allergies.contains("nut") || allergies.contains("peanut"))
                && mealName.contains("nut")) {
                score -= 80;
            }
        }

        // Check chronic conditions and provide compatible meals
        if (user.getConditions() != null && !user.getConditions().isEmpty()) {
            String conditions = user.getConditions().toLowerCase();
            
            if (conditions.contains("diabetes")) {
                if (meal.dietaryFlags.contains("diabetic-friendly")) score += 30;
                if (meal.calories < 400) score += 10;
            }
            if (conditions.contains("hypertension")) {
                if (meal.dietaryFlags.contains("low-sodium")) score += 30;
                if (meal.dietaryFlags.contains("low-fat")) score += 10;
            }
            if (conditions.contains("asthma")) {
                if (meal.dietaryFlags.contains("low-fat")) score += 20;
            }
        }

        // BMI-based calorie recommendations
        if (user.getHeight() > 0 && user.getWeight() > 0) {
            double bmi = user.getWeight() / ((user.getHeight() / 100.0) * (user.getHeight() / 100.0));
            
            if (bmi > 25) { // Overweight - prefer lower calorie meals
                if (meal.calories < 350) score += 25;
                if (meal.dietaryFlags.contains("low-fat")) score += 15;
            } else if (bmi < 18.5) { // Underweight - prefer higher calorie meals
                if (meal.calories > 400) score += 25;
                if (meal.dietaryFlags.contains("high-protein")) score += 15;
            }
        }

        // Prefer high-protein for muscle building
        if (meal.dietaryFlags.contains("high-protein")) score += 10;
        if (meal.dietaryFlags.contains("omega3")) score += 10;
        if (meal.dietaryFlags.contains("high-fiber")) score += 8;

        return Math.max(0, Math.min(100, score)); // Clamp between 0-100
    }

    /**
     * Get compatibility percentage with explanation
     */
    private int getCompatibilityPercentage(MealSuggestion meal, User user) {
        return calculateHealthScore(meal, user);
    }

    /**
     * Create Meal object from suggestion for logging
     */
    public Meal createMealFromSuggestion(String mealName, String cuisine, User user) {
        MealSuggestion suggestion = mealDatabase.stream()
                .filter(m -> m.name.equalsIgnoreCase(mealName))
                .findFirst()
                .orElse(null);

        if (suggestion == null) {
            return null;
        }

        Meal meal = new Meal();
        meal.setMealType(suggestion.mainIngredient.toLowerCase());
        meal.setFoodItems(suggestion.name);
        meal.setNotes("Suggested meal from cuisine: " + cuisine + ". Calories: " + suggestion.calories);
        meal.setUser(user);
        meal.setLoggedAt(java.time.LocalDateTime.now());

        return meal;
    }
}
