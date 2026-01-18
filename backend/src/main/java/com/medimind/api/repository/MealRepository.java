package com.medimind.api.repository;

import com.medimind.api.model.Meal;
import com.medimind.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MealRepository extends JpaRepository<Meal, Long> {
    List<Meal> findByUserOrderByLoggedAtDesc(User user);
    List<Meal> findByUserAndLoggedAtBetween(User user, LocalDateTime start, LocalDateTime end);
}
