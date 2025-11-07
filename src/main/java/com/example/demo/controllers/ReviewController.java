package com.example.demo.controllers;

import com.example.demo.models.Review;
import com.example.demo.services.ReviewService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @PostMapping("/{username}")
    public Review createReview(@PathVariable String username, @RequestBody Review review) {
        return service.saveReview(username, review);
    }

    @GetMapping
    public List<Review> getAllReviews() {
        return service.getAllReviews();
    }

    @GetMapping("/user/{username}")
    public List<Review> getUserReviews(@PathVariable String username) {
        return service.getReviewsByUser(username);
    }

    @GetMapping("/{id}")
    public Review getReviewDetail(@PathVariable Long id) {
        return service.getReviewById(id);
    }
}
