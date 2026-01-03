package com.medimind.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
public class MoodService {

    @Autowired
    private MoodRepository moodRepository;

    // Empathy messages based on mood
    private static final List<String> SUPPORTIVE_MESSAGES = Arrays.asList(
        "It's okay to not be okay. You're doing your best.",
        "Every small step counts. Keep going!",
        "You're stronger than you think.",
        "Take a deep breath. You've got this.",
        "Celebrate today — you showed up for yourself!"
    );

    public Mood logMood(Long userId, int moodRating, String message) {
        User user = new User();
        user.setId(userId);

        // Prevent duplicate entries for same day
        Mood existing = moodRepository.findByUserAndLoggedDate(user, LocalDate.now());
        if (existing != null) {
            existing.setMoodRating(moodRating);
            existing.setMessage(message);
            return moodRepository.save(existing);
        }

        Mood mood = new Mood();
        mood.setUser(user);
        mood.setMoodRating(moodRating);
        mood.setMessage(message);
        mood.setLoggedDate(LocalDate.now());

        return moodRepository.save(mood);
    }

    public List<Mood> getMoodHistory(Long userId) {
        User user = new User();
        user.setId(userId);
        return moodRepository.findByUserOrderByLoggedDateDesc(user);
    }

    public String getEmpathyMessage(int moodRating) {
        if (moodRating <= 2) {
            return "I'm here for you. 💙 Take it one moment at a time.";
        } else if (moodRating <= 3) {
            return "You're making progress — that matters.";
        } else {
            return "You're shining today! 🌟 Keep it up!";
        }
    }

    public String getRandomSupportiveMessage() {
        Random rand = new Random();
        return SUPPORTIVE_MESSAGES.get(rand.nextInt(SUPPORTIVE_MESSAGES.size()));
    }
}