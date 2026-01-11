package com.medimind.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mood")
@CrossOrigin(origins = "http://localhost:5173")
public class MoodController {

    @Autowired
    private MoodService moodService;

    @Autowired
    private UserService userService;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = ((UserDetails) principal).getUsername();
        return userService.findByEmail(email);
    }

    // DTO for incoming request
    public static class LogMoodRequest {
        private int moodRating;
        private String message;

        public int getMoodRating() { return moodRating; }
        public void setMoodRating(int moodRating) { this.moodRating = moodRating; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    @PostMapping("/log")
    public ResponseEntity<?> logMood(@RequestBody LogMoodRequest request) {
        try {
            if (request.getMoodRating() < 1 || request.getMoodRating() > 5) {
                return ResponseEntity.badRequest().body("Mood rating must be between 1 and 5.");
            }
            
            User user = getCurrentUser();
            
            Mood mood = new Mood();
            mood.setUser(user); // Setting the user object directly
            mood.setMoodRating(request.getMoodRating());
            mood.setMessage(request.getMessage());
            mood.setLoggedDate(java.time.LocalDate.now());

            Mood saved = moodService.logMood(mood); // Now this works with the new Service
            String empathy = moodService.getEmpathyMessage(request.getMoodRating());
            
            return ResponseEntity.ok(new EmpathyResponse(saved, empathy));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<Mood>> getHistory() {
        User user = getCurrentUser();
        List<Mood> moods = moodService.getMoodHistory(user); // Now this works with the new Service
        return ResponseEntity.ok(moods);
    }

    // DTO for outgoing response
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