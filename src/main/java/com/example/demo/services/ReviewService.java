package com.example.demo.services;

import com.example.demo.models.Review;
import com.example.demo.models.User;
import com.example.demo.repo.ReviewRepository;
import com.example.demo.repo.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    // ✅ บันทึกรีวิว โดยเก็บ reviewer_username (เลขนักศึกษา)
    public Review saveReview(String username, Review review) {
        // ดึงข้อมูลผู้ใช้จาก username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ เก็บ username ของผู้รีวิว (ไม่ต้องอ้าง FK user_id แล้ว)
        review.setReviewerUsername(user.getUsername());
        review.setCreatedAt(LocalDateTime.now());

        // ✅ ตั้งค่า avatar ถ้ายังไม่มี
        if (review.getAvatar() == null || review.getAvatar().isBlank()) {
            review.setAvatar("/Avatar/Anonymous.png");
        }

        // ✅ โหมด Anonymous (ไม่โชว์ชื่อ แต่ DB จะรู้ว่าใครเป็นเจ้าของ)
        if (review.isAnonymous()) {
            // ไม่ต้องลบ reviewerUsername เพราะใช้สำหรับตรวจสอบหลังบ้านได้
        }

        return reviewRepository.save(review);
    }

    // ✅ ดึงรีวิวทั้งหมด (สำหรับ Dashboard)
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    // ✅ ดึงรีวิวเฉพาะของผู้ใช้ (โดยใช้ reviewer_username)
    public List<Review> getReviewsByUser(String username) {
        return reviewRepository.findByReviewerUsername(username);
    }
}
