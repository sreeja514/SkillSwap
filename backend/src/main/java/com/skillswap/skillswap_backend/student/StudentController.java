
package com.skillswap.skillswap_backend.student;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://skill-swap-15th4zkno-sreeja19.vercel.app"
})
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        Optional<Student> student = studentRepository.findById(id);

        return student.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@RequestBody Student student) {

        if (student == null || student.getEmail() == null
                || student.getEmail().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email is required."));
        }

        String email = student.getEmail().trim();

        if (studentRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "Student already exists with this email."
                    ));
        }

        student.setEmail(email);

        Student savedStudent = studentRepository.save(student);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedStudent);
    }
}
```