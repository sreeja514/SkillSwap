
import { useState } from "react";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    skillsToTeach: "",
    skillsToLearn: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("Registering...");

    try {
      const response = await fetch(
        "http://localhost:8080/api/students/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.text();

      if (response.ok) {
        setMessage("Registration successful!");
        setForm({
          name: "",
          email: "",
          password: "",
          skillsToTeach: "",
          skillsToLearn: "",
        });
      } else {
        setMessage("Registration failed: " + result);
      }
    } catch (error) {
      setMessage("Cannot connect to the backend. Check if it is running.");
    }
  }

  return (
    <div style={{ maxWidth: "450px", margin: "40px auto", padding: "25px" }}>
      <h1>SkillSwap</h1>
      <h2>Student Registration</h2>
      <p>Join our community to teach and learn new skills!</p>

      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your name"
          required
          style={inputStyle}
        />

        <label>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          style={inputStyle}
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Create a password"
          required
          minLength={8}
          style={inputStyle}
        />

        <label>Skills You Can Teach</label>
        <input
          name="skillsToTeach"
          value={form.skillsToTeach}
          onChange={handleChange}
          placeholder="e.g. Python, Drawing"
          style={inputStyle}
        />

        <label>Skills You Want to Learn</label>
        <input
          name="skillsToLearn"
          value={form.skillsToLearn}
          onChange={handleChange}
          placeholder="e.g. Machine Learning"
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          Register
        </button>
      </form>

      <p role="status">{message}</p>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  margin: "8px 0 16px",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#5b4bdb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default Register;
