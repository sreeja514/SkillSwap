# Spring Boot backend additions for SkillSwap

Your existing `POST /api/students/register` and `GET /api/students` endpoints are preserved. Add the login controller below to your existing backend.

## Important security note
Your current Student entity reportedly stores a password field directly. The simple controller below is suitable only for a local college prototype using test accounts. It compares the existing stored value and is **not production authentication**. Do not use real/reused passwords. Before deployment, add BCrypt password hashing, Spring Security, authorization, HTTPS, and proper session/JWT handling.

## File: `src/main/java/com/skillswap/skillswap/controller/AuthController.java`

Adjust the package name if your project uses a different package. This controller expects your existing `Student` entity and `StudentRepository` to be in the packages shown in the imports.

```java
package com.skillswap.skillswap.controller;

import com.skillswap.skillswap.entity.Student;
import com.skillswap.skillswap.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private final StudentRepository studentRepository;

    public AuthController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        String password = body.getOrDefault("password", "");

        Optional<Student> found = studentRepository.findAll().stream()
            .filter(s -> s.getEmail() != null && s.getEmail().equalsIgnoreCase(email))
            .filter(s -> s.getPassword() != null && s.getPassword().equals(password))
            .findFirst();

        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid email or password."));
        }

        Student s = found.get();
        return ResponseEntity.ok(Map.of(
            "id", s.getId(),
            "name", s.getName() == null ? "" : s.getName(),
            "email", s.getEmail() == null ? "" : s.getEmail(),
            "skillsToTeach", s.getSkillsToTeach() == null ? "" : s.getSkillsToTeach(),
            "skillsToLearn", s.getSkillsToLearn() == null ? "" : s.getSkillsToLearn()
        ));
    }
}
```

This intentionally omits password from the response. For a small prototype it uses the repository's current entity shape, but a production app should query by email and verify a BCrypt hash instead of scanning all students and comparing raw passwords.

## CORS
Your existing StudentController can keep:
```java
@CrossOrigin(origins = "http://localhost:5173")
```
If you move the frontend to another port, update the origin accordingly.
