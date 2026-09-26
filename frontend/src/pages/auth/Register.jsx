import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    centerId: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in both the password and confirm password fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Registration blocked: Password and Confirm Password do not match. Please ensure both passwords are identical.");
      return;
    }

    if (!formData.terms) {
      setError("Please agree to the Terms of Use and Patient Privacy Policy.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.registerOperator({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        centerId: formData.centerId,
        password: formData.password,
      });

      setSuccessMsg("Operator account registered successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to register account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="auth-logo">◉</div>
          </Link>
          <h1>Create Operator Account</h1>
          <p>Register as a certified screening operator on DR-Screen AI</p>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}

        {successMsg && (
          <div
            style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "16px",
              fontWeight: "600",
            }}
          >
            ✓ {successMsg}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="e.g. Alex Rivera"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. alex.rivera@screening.org"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="+1 (555) 019-2834"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Organization / Screening Center</label>
            <input
              type="text"
              name="organization"
              placeholder="e.g. Apex Community Health"
              value={formData.organization}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Center ID</label>
            <input
              type="text"
              name="centerId"
              placeholder="e.g. SC-EAST-04"
              value={formData.centerId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
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

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={
                    formData.password && formData.confirmPassword
                      ? {
                          borderColor:
                            formData.password === formData.confirmPassword
                              ? "#22c55e"
                              : "#ef4444",
                        }
                      : {}
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {formData.password && formData.confirmPassword && (
                formData.password !== formData.confirmPassword ? (
                  <span
                    style={{
                      color: "#dc2626",
                      fontSize: "11px",
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: "600",
                    }}
                  >
                    ⚠️ Passwords do not match
                  </span>
                ) : (
                  <span
                    style={{
                      color: "#16a34a",
                      fontSize: "11px",
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: "600",
                    }}
                  >
                    ✓ Passwords match
                  </span>
                )
              )}
            </div>
          </div>

          <label className="terms-checkbox">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
            />
            <span>I agree to the Terms of Use and Patient Privacy Policy.</span>
          </label>

          <button
            type="submit"
            className="auth-button"
            disabled={
              isSubmitting ||
              Boolean(
                formData.password &&
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword
              )
            }
          >
            {isSubmitting ? "Creating Account..." : "Create Operator Account →"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Prefer social SSO or Passkey?</span>
          <Link to="/clerk-register" style={{ color: "#6c47ff", fontWeight: "700" }}>
            🔐 Register via Clerk
          </Link>
        </div>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>

        <div className="auth-footer">
          <span>Ophthalmologist or Specialist?</span>
          <Link to="/register/doctor">Register as Doctor →</Link>
        </div>
      </div>
    </div>
  );
}