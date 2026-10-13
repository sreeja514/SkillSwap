
package com.skillswap.skillswap_backend.student;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "skills_to_learn")
    private String skillsToLearn;

    @Column(name = "skills_to_teach")
    private String skillsToTeach;

    public Student() {}

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getSkillsToLearn() { return skillsToLearn; }
    public String getSkillsToTeach() { return skillsToTeach; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setSkillsToLearn(String skillsToLearn) { this.skillsToLearn = skillsToLearn; }
    public void setSkillsToTeach(String skillsToTeach) { this.skillsToTeach = skillsToTeach; }
}
