package com.medimind.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MedicineService {

    @Autowired
    private MedicineRepository medicineRepository;

    public Medicine addMedicine(Medicine medicine) {
        return medicineRepository.save(medicine);
    }

public List<Medicine> getMedicinesByUser(User user) {
    return medicineRepository.findByUser(user);
} 

 public Medicine markAsTaken(Long id, User user) {
    Medicine medicine = medicineRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Medicine not found"));
    
    if (!medicine.getUser().getId().equals(user.getId())) {
        throw new RuntimeException("Not your medicine!");
    }
     
    medicine.setTakenToday(true);
    medicine.setLoggedAt(LocalDateTime.now());
    return medicineRepository.save(medicine);
}
}
