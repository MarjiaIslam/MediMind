package com.medimind.api.controller;

import com.medimind.api.model.User;
import com.medimind.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired private UserRepository userRepository;

    @PutMapping("/update")
    public User updateUser(@RequestBody User updatedUser) {
        User existing = userRepository.findById(updatedUser.getId()).orElseThrow();
        // Update fields
        existing.setHeight(updatedUser.getHeight());
        existing.setWeight(updatedUser.getWeight());
        existing.setAllergies(updatedUser.getAllergies());
        existing.setConditions(updatedUser.getConditions());
        existing.setMood(updatedUser.getMood());
        existing.setWaterIntake(updatedUser.getWaterIntake());
        return userRepository.save(existing);
    }
}