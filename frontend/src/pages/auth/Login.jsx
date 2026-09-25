import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("operator");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both your email and password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (role === "ophthalmologist") {
        sessionStorage.setItem(
          "user_session",
          JSON.stringify({
            role: "doctor",
            title: "Ophthalmologist",
            name: "Dr. Sarah Jenkins, MD",
            identifier: email,
          })
        );
        navigate("/doctor");
      } else {
        sessionStorage.setItem(
          "user_session",
          JSON.stringify({
            role: "operator",
            title: "Screening Operator",
            name: "Alex Rivera",
            identifier: email,
          })
        );
        navigate("/operator");
      }
    }, 500);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <div className="auth-logo">◉</div>
          <h1>Healthcare Login</h1>
          <p>Select a role and sign in to the DR-Screen AI platform.</p>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Role</label>
            <div className="role-select-row">
              <button
                type="button"
                className={`role-select-btn ${role === "operator" ? "active" : ""}`}
                onClick={() => setRole("operator")}
              >
                Screening Operator
              </button>
              <button
                type="button"
                className={`role-select-btn ${role === "ophthalmologist" ? "active" : ""}`}
                onClick={() => setRole("ophthalmologist")}
              >
                Ophthalmologist
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In →"}
          </button>

        </form>

        <div className="auth-footer">
          <span>Don't have an account?</span>
          <Link to={role === "ophthalmologist" ? "/register/doctor" : "/register"}>
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
}
