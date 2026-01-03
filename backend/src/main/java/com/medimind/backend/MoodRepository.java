package com.medimind.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MoodRepository extends JpaRepository<Mood, Long> {
    List<Mood> findByUserOrderByLoggedDateDesc(User user);
    Mood findByUserAndLoggedDate(User user, LocalDate date);
}