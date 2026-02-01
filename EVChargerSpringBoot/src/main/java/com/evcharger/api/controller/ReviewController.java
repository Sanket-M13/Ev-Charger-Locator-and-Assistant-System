package com.evcharger.api.controller;

import com.evcharger.api.entity.Review;
import com.evcharger.api.repository.ReviewRepository;
import com.evcharger.api.repository.UserRepository;
import com.evcharger.api.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StationRepository stationRepository;

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> reviewData) {
        try {
            Review review = new Review();
            review.setUserId(Long.valueOf(reviewData.get("userId").toString()));
            review.setStationId(Long.valueOf(reviewData.get("stationId").toString()));
            review.setRating(Integer.valueOf(reviewData.get("rating").toString()));
            review.setComment(reviewData.get("comment").toString());
            
            reviewRepository.save(review);
            return ResponseEntity.ok(Map.of("message", "Review submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllReviews() {
        try {
            List<Review> reviews = reviewRepository.findAll();
            return ResponseEntity.ok(Map.of("reviews", reviews));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}