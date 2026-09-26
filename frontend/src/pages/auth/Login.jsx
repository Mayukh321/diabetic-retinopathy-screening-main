import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { hasValidClerkKey } from "../../components/auth/ClerkAuthWrapper";
import "../../styles/auth.css";

export default function Login({ initialRole = "operator" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  useEffect(() => {
    // Clear any stale local session when landing on login
    sessionStorage.removeItem("user_session");

    const err = searchParams.get("error");
    const deniedEmail = searchParams.get("denied_email");
    if (err === "auth_required") {
      setError("Clinical Session Required: Please sign in with a registered database account.");
    } else if (err === "uncreated_account") {
      setError(
        deniedEmail
          ? `Access Denied: The account "${deniedEmail}" is not found in the database. Uncreated accounts cannot log in.`
          : "Access Denied: Uncreated or unregistered accounts cannot log in."
      );
    }
  }, [searchParams]);

  const handleDemoFill = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === "ophthalmologist") {
      setEmail("dr.jenkins@eyeclinics.org");
      setPassword("RetinaDoc2026!");
    } else {
      setEmail("alex.rivera@screening.org");
      setPassword("OperatorSecure2026!");
    }
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both your email and password.");
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate directly against the PostgreSQL database
      const result = await api.login(email.trim(), password, role);
      const user = result.user;

      if (user.role === "doctor") {
        sessionStorage.setItem(
          "user_session",
          JSON.stringify({
            userId: user.user_id,
            role: "doctor",
            title: "Ophthalmologist",
            name: user.full_name || "Dr. Sarah Jenkins, MD",
            identifier: user.email,
            specialization: user.specialization || "Vitreo-Retinal Specialist",
            license: user.registration_number || "MCI-78291",
            authMethod: "database",
          })
        );
        navigate("/doctor");
      } else {
        sessionStorage.setItem(
          "user_session",
          JSON.stringify({
            userId: user.user_id,
            role: "operator",
            title: "Screening Operator",
            name: user.full_name || "Alex Rivera",
            identifier: user.email,
            centerId: user.center_id || "SC-MAIN-001",
            authMethod: "database",
          })
        );
        navigate("/operator");
      }
    } catch (err) {
      setError(
        err.message ||
          "Invalid email or password. Only registered database users can log in."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="auth-logo">◉</div>
          </Link>
          <h1>Healthcare Login</h1>
          <p>Select your clinical role and sign in to the DR-Screen AI platform.</p>
        </div>


        {error && <div className="auth-error-alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Role</label>
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
              placeholder="e.g. user@hospital.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Signing In..." : `Sign In as ${role === "ophthalmologist" ? "Ophthalmologist" : "Operator"} →`}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account?</span>
          <Link to={role === "ophthalmologist" ? "/register/doctor" : "/register"}>
            {role === "ophthalmologist" ? "Register Doctor Account" : "Register Operator Account"}
          </Link>
        </div>

        <div style={{ textAlign: "center", marginTop: "14px" }}>
          <Link to="/" style={{ color: "#7c8995", fontSize: "12px", textDecoration: "none" }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
