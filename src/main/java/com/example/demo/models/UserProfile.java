package com.example.demo.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profile")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Size(min = 3, max = 50, message = "Display name must be between 3 and 50 characters")
    @Column(columnDefinition = "NVARCHAR(255)")
    private String displayName;

    @Size(max = 255, message = "Bio must not exceed 255 characters")
    @Column(columnDefinition = "NVARCHAR(255)")
    private String bio;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String email;

    // ✅ เพิ่ม NVARCHAR ให้รองรับภาษาไทย
    @Column(columnDefinition = "NVARCHAR(255)")
    private String faculty;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String department;

    private LocalDateTime lastLogin = LocalDateTime.now();

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
}
