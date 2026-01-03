package com.medimind.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend requests
public class UserController {

    @Autowired
    private UserService userService;

    // Request body class for registration
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private int age;
        private double weight;
        private String allergies;
        private String chronicConditions;

        // Getters and setters (required for JSON parsing)
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public int getAge() { return age; }
        public void setAge(int age) { this.age = age; }

        public double getWeight() { return weight; }
        public void setWeight(double weight) { this.weight = weight; }

        public String getAllergies() { return allergies; }
        public void setAllergies(String allergies) { this.allergies = allergies; }

        public String getChronicConditions() { return chronicConditions; }
        public void setChronicConditions(String chronicConditions) { this.chronicConditions = chronicConditions; }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Create User object from request
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setAge(request.getAge());
            user.setWeight(request.getWeight());
            user.setAllergies(request.getAllergies());
            user.setChronicConditions(request.getChronicConditions());

            User savedUser = userService.registerUser(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // Login request class
public static class LoginRequest {
    private String email;
    private String password;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    try {
        User user = userService.authenticate(request.getEmail(), request.getPassword());
        // Remove password from response for security
        user.setPassword(null);
        return ResponseEntity.ok(user);
    } catch (Exception e) {
        return ResponseEntity.status(401).body(e.getMessage());
    }
}
    
}