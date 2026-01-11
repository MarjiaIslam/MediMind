package com.medimind.api.service;

import com.medimind.api.model.Meal;
import com.medimind.api.model.User;
import com.medimind.api.repository.MealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MealService {
    @Autowired
    private MealRepository mealRepository;

    // CREATE
    public Meal logMeal(Meal meal) {
        meal.setLoggedAt(LocalDateTime.now());
        return mealRepository.save(meal);
    }

    // READ - Get meal history for user
    public List<Meal> getMealHistory(User user) {
        return mealRepository.findByUserOrderByLoggedAtDesc(user);
    }

    // READ - Get single meal by ID
    public Optional<Meal> getMealById(Long mealId) {
        return mealRepository.findById(mealId);
    }

    // READ - Get all meals
    public List<Meal> getAllMeals() {
        return mealRepository.findAll();
    }

    // UPDATE - Update meal
    public Optional<Meal> updateMeal(Long mealId, String mealType, String foodItems, String notes) {
        Optional<Meal> meal = mealRepository.findById(mealId);
        if (meal.isPresent()) {
            Meal existingMeal = meal.get();
            if (mealType != null) existingMeal.setMealType(mealType);
            if (foodItems != null) existingMeal.setFoodItems(foodItems);
            if (notes != null) existingMeal.setNotes(notes);
            return Optional.of(mealRepository.save(existingMeal));
        }
        return Optional.empty();
    }

    // DELETE - Delete meal
    public boolean deleteMeal(Long mealId) {
        if (mealRepository.existsById(mealId)) {
            mealRepository.deleteById(mealId);
            return true;
        }
        return false;
    }
}

