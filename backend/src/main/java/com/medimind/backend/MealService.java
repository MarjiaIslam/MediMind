package com.medimind.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
@Data
@Service
public class MealService {

    @Autowired
    private MealRepository mealRepository;

    public Meal logMeal(Meal meal) {
        meal.setLoggedAt(LocalDateTime.now());
        return mealRepository.save(meal);
    }

    public List<Meal> getMealHistory(User user) {
        return mealRepository.findByUserOrderByLoggedAtDesc(user);
    }
}