package com.medimind.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mood")
@CrossOrigin(origins = "http://localhost:5173")
public class MoodController {

    @Autowired
    private MoodService moodService;

    public static class LogMoodRequest {
        private int moodRating;
        private String message;

        public int getMoodRating() { return moodRating; }
        public void setMoodRating(int moodRating) { this.moodRating = moodRating; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    @PostMapping("/log")
    public ResponseEntity<?> logMood(@RequestBody LogMoodRequest request, @RequestParam Long userId) {
        try {
            if (request.getMoodRating() < 1 || request.getMoodRating() > 5) {
                return ResponseEntity.badRequest().body("Mood rating must be between 1 and 5.");
            }
            Mood mood = moodService.logMood(userId, request.getMoodRating(), request.getMessage());
            String empathy = moodService.getEmpathyMessage(request.getMoodRating());
            return ResponseEntity.ok(new EmpathyResponse(mood, empathy));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Mood>> getHistory(@PathVariable Long userId) {
        List<Mood> moods = moodService.getMoodHistory(userId);
        return ResponseEntity.ok(moods);
    }

    // Helper class for combined response
    public static class EmpathyResponse {
        private Mood mood;
        private String empathyMessage;

        public EmpathyResponse(Mood mood, String empathyMessage) {
            this.mood = mood;
            this.empathyMessage = empathyMessage;
        }

        public Mood getMood() { return mood; }
        public String getEmpathyMessage() { return empathyMessage; }
    }
}