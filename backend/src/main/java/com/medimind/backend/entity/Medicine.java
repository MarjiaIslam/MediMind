package com.medimind.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import com.medimind.backend.entity.User; // Ensure this matches your User entity location

@Entity
@Data
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String dose;
    private LocalDateTime scheduledTime;
    private boolean isTaken;

    // This satisfies Task #2: Relationship
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; 
}
