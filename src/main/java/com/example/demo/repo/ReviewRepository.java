package com.example.demo.repo;

import com.example.demo.models.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    // ✅ ดึงรีวิวทั้งหมดของผู้ใช้ตาม username
    List<Review> findByReviewerUsername(String reviewerUsername);
}
