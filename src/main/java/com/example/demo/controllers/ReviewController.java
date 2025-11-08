package com.example.demo.controllers;

import com.example.demo.models.Review;
import com.example.demo.services.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:9090") // ✅ ไม่ต้อง allowCredentials เพราะไม่ใช้ cookie แล้ว
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // ✅ POST /api/reviews/add?username=<ชื่อผู้ใช้>
    @PostMapping("/add")
    public ResponseEntity<Object> addReview(
            @RequestParam String username,
            @RequestBody Review review) {

        System.out.println("📩 [REVIEW ADD] username = " + username);

        if (username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("⚠️ ต้องระบุ username เพื่อบันทึกรีวิว");
        }

        try {
            Review saved = reviewService.saveReview(username, review);
            System.out.println("✅ Review saved successfully by " + username);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("❌ ERROR saving review: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ เกิดข้อผิดพลาดระหว่างบันทึกรีวิว: " + e.getMessage());
        }
    }

    // ✅ GET /api/reviews/all — ดึงรีวิวทั้งหมด
    @GetMapping("/all")
    public ResponseEntity<List<Review>> getAllReviews() {
        try {
            List<Review> reviews = reviewService.getAllReviews();
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            System.err.println("❌ ERROR fetching reviews: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ GET /api/reviews/user?username=<ชื่อผู้ใช้>
    @GetMapping("/user")
    public ResponseEntity<Object> getReviewsByCurrentUser(
            @RequestParam String username) {

        System.out.println("🧭 [DEBUG] Fetching reviews for username = " + username);

        if (username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("⚠️ ต้องระบุ username ก่อนดึงรีวิวของผู้ใช้");
        }

        try {
            return ResponseEntity.ok(reviewService.getReviewsByUser(username));
        } catch (Exception e) {
            System.err.println("❌ ERROR fetching user's reviews: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ เกิดข้อผิดพลาดขณะดึงข้อมูลรีวิวของผู้ใช้");
        }
    }
}
