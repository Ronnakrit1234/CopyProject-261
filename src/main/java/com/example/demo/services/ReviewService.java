package com.example.demo.services;

import com.example.demo.models.*;
import com.example.demo.repo.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    public Review saveReview(String username, Review review) {
        User user = userRepository.findByUsername(username);
        if (user == null) throw new RuntimeException("User not found");
        review.setAuthor(user);
        return reviewRepository.save(review);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public List<Review> getReviewsByUser(String username) {
        User user = userRepository.findByUsername(username);
        return reviewRepository.findByAuthor(user);
    }

    public Review getReviewById(Long id) {
        return reviewRepository.findById(id).orElse(null);
    }
}
