package com.medimind.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "journal_entries")
public class JournalEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    
    @Column(length = 5000)
    private String content; // The diary/journal text
    
    private String mood; // Mood at time of writing
    
    private String title; // Optional title
    
    @Column(length = 500)
    private String tags; // Comma-separated tags for searching
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
