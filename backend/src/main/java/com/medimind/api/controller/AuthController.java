package com.medimind.api.controller;

import com.medimind.api.model.User;
import com.medimind.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) return ResponseEntity.badRequest().body("Username taken");
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data) {
        String id = data.get("identifier");
        String pw = data.get("password");
        return userRepository.findByUsernameOrEmail(id, id)
            .filter(u -> u.getPassword().equals(pw))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(401).build());
    }
}