package com.example.demo.controllers;

import com.example.demo.models.Comment;
import com.example.demo.services.CommentService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService service;

    public CommentController(CommentService service) {
        this.service = service;
    }

    // ✅ ดึงคอมเมนต์ทั้งหมดของรีวิว
    @GetMapping("/{reviewId}")
    public List<Comment> getComments(@PathVariable Long reviewId) {
        return service.getCommentsByReview(reviewId);
    }

    // ✅ เพิ่มคอมเมนต์ใหม่
    @PostMapping
    public Comment addComment(@RequestBody Comment comment) {
        if (comment.getAuthor() == null || comment.getAuthor().isBlank()) {
            comment.setAuthor("Anonymous");
        }
        return service.addComment(comment);
    }
}
