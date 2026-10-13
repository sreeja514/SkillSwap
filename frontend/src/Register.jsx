
import { useState } from "react";
import "./Register.css";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    skillsToTeach: "",
    skillsToLearn: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);

    if (form.password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== confirmPassword) {
      setMessage("Passwords do not match. Please check again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/students/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            skillsToTeach: form.skillsToTeach.trim(),
            skillsToLearn: form.skillsToLearn.trim(),
          }),
        }
      );

      const result = await response.text();

      if (response.ok) {
        setSuccess(true);
        setMessage("Registration successful! Welcome to SkillSwap.");

        setForm({
          name: "",
          email: "",
          password: "",
          skillsToTeach: "",
          skillsToLearn: "",
        });

        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);
      } else {
        setMessage("Registration failed: " + result);
      }
    } catch (error) {
      setMessage(
        "Cannot connect to the backend. Make sure Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="logo">SkillSwap</div>

        <p className="subtitle">
          Share your skills. Learn something new.
        </p>

        <h2>Create Your Account</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            autoComplete="name"
            required
          />

          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              required
            />

            <button
              type="button"
              className="eye-button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-wrapper">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="eye-button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <label htmlFor="skillsToTeach">
            Skills You Can Teach
          </label>
          <input
            id="skillsToTeach"
            name="skillsToTeach"
            type="text"
            value={form.skillsToTeach}
            onChange={handleChange}
            placeholder="Python, Java, Web Development"
          />
          <p className="field-hint">
            Enter multiple skills separated by commas.
          </p>

          <label htmlFor="skillsToLearn">
            Skills You Want to Learn
          </label>
          <input
            id="skillsToLearn"
            name="skillsToLearn"
            type="text"
            value={form.skillsToLearn}
            onChange={handleChange}
            placeholder="Machine Learning, SQL, React"
          />
          <p className="field-hint">
            You can enter more than one skill.
          </p>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        {message && (
          <p
            className={success ? "success-message" : "status-message"}
            role="status"
          >
            {message}
          </p>
        )}

        <p className="footer-text">
          Learn together. Grow together.
        </p>
      </div>
    </div>
  );
}

export default Register;
