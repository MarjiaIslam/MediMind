package com.medimind.backend.controller;

import com.medimind.backend.model.User;
import com.medimind.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Adjusted for Vite default port
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return Map.of("success", false, "message", "Email already exists");
        }
        userRepository.save(user);
        return Map.of("success", true, "message", "Registered successfully", "user", user);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");
        
        Optional<User> user = userRepository.findByEmail(email);
        
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return Map.of("success", true, "user", user.get());
        }
        return Map.of("success", false, "message", "Invalid credentials");
    }
}
