package com.medimind.api.controller;

import com.medimind.api.model.Medicine;
import com.medimind.api.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medicine")
@CrossOrigin(origins = "*")
public class MedicineController {

    @Autowired private MedicineRepository medicineRepository;

    // Get all medicines for a user
    @GetMapping("/{userId}")
    public List<Medicine> getMedicines(@PathVariable Long userId) {
        return medicineRepository.findByUserId(userId);
    }

    // Add a new medicine
    @PostMapping("/add")
    public Medicine addMedicine(@RequestBody Medicine medicine) {
        return medicineRepository.save(medicine);
    }

    // Toggle Taken Status (Mark as done)
    @PutMapping("/toggle/{id}")
    public Medicine toggleTaken(@PathVariable Long id) {
        Medicine med = medicineRepository.findById(id).orElseThrow();
        med.setTaken(!med.isTaken());
        return medicineRepository.save(med);
    }
    
    // Delete medicine
    @DeleteMapping("/{id}")
    public void deleteMedicine(@PathVariable Long id) {
        medicineRepository.deleteById(id);
    }
}