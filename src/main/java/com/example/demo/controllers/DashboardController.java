package com.example.demo.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    @GetMapping("")
    public String dashboard() {
        // เรียกใช้ templates/dashboard/dashboard.html
        return "dashboard/dashboard";
    }

    @GetMapping("/profile")
    public String profile() {
        return "dashboard/profile";
    }

    @GetMapping("/review")
    public String review() {
        return "dashboard/review";
    }

    @GetMapping("/history")
    public String history() {
        return "dashboard/history";
    }

    @GetMapping("/review-detail")
    public String reviewDetail() {
        return "dashboard/review-detail";
    }

    @GetMapping("/guest")
    public String guestDashboard() {
        return "dashboard/guestDashboard";
    }
}
