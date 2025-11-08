package com.example.demo.services;

import com.example.demo.models.Comment;
import com.example.demo.repo.CommentRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CommentService {
    private final CommentRepository repo;

    public CommentService(CommentRepository repo) {
        this.repo = repo;
    }

    public List<Comment> getCommentsByReview(Long reviewId) {
        return repo.findByReviewId(reviewId);
    }

    public Comment addComment(Comment comment) {
        return repo.save(comment);
    }
}
