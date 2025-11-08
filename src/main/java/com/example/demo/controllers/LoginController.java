package com.example.demo.controllers;

import com.example.demo.models.User;
import com.example.demo.repo.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
public class LoginController {

    private final UserRepository userRepository;

    public LoginController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ✅ แสดงหน้า index.html (หน้า login)
    @GetMapping("/")
    public String home() {
        return "redirect:/index.html";
    }

    // ✅ ตรวจสอบ username/password แล้วบันทึกลง session
    @PostMapping("/login")
    @ResponseBody
    public ResponseEntity<String> login(@RequestParam String username,
                                        @RequestParam(required = false) String password,
                                        HttpSession session) {

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("❌ ไม่พบบัญชีผู้ใช้");
        }

        session.setAttribute("username", username);
        System.out.println("✅ Login success! Session username = " + username);
        return ResponseEntity.ok("✅ Login success");
    }

    // ✅ สำหรับตรวจ session (debug)
    @GetMapping("/session-check")
    @ResponseBody
    public ResponseEntity<Object> checkSession(HttpSession session) {
        String username = (String) session.getAttribute("username");
        return ResponseEntity.ok(username != null ? username : "anonymous");
    }

    // ✅ logout
    @PostMapping("/logout")
    @ResponseBody
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out");
    }
}
