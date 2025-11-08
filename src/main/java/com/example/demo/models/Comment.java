package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long reviewId;     // 🧩 ผูกกับ Review
    private Long userId;       // ✅ FK ถึง user.id
    private String studentId;  // ✅ เพิ่มฟิลด์ใหม่ไว้เก็บเลขนักศึกษา
    private String text;
    private String author = "Anonymous";
    private LocalDateTime createdAt = LocalDateTime.now();

    public Comment() {}

    public Comment(Long reviewId, Long userId, String studentId, String text, String author) {
        this.reviewId = reviewId;
        this.userId = userId;
        this.studentId = studentId;
        this.text = text;
        this.author = author != null ? author : "Anonymous";
        this.createdAt = LocalDateTime.now();
    }

    // ✅ Getter / Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getReviewId() { return reviewId; }
    public void setReviewId(Long reviewId) { this.reviewId = reviewId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
