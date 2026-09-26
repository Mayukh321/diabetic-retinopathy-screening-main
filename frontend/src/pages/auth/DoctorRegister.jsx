import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function DoctorRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    registrationNumber: "",
    hospital: "",
    specialization: "Ophthalmology",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [certificate, setCertificate] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in both the password and confirm password fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Registration blocked: Password and Confirm Password do not match. Please ensure both passwords are identical.");
      return;
    }

    if (!formData.terms) {
      setError("Please agree to the Terms & Privacy Policy.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.registerDoctor({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        registrationNumber: formData.registrationNumber,
        hospital: formData.hospital,
        specialization: formData.specialization,
        password: formData.password,
      });

      navigate("/registration-pending");
    } catch (err) {
      setError(err.message || "Doctor registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <Link to="/" className="register-logo">
            <span className="register-logo-icon">◉</span>
            <span>DR-Screen AI</span>
          </Link>
          <h1>Create Ophthalmologist Account</h1>
          <p>Register as a certified doctor to review AI-assisted retinal screenings.</p>
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="form-section">
            <div className="form-section-title">Personal Information</div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name & Title</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Dr. Sarah Jenkins, MD"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Medical Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="doctor@eyeclinics.org"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 234-5678"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="form-section">
            <div className="form-section-title">Professional Credentials</div>

            <div className="form-group">
              <label htmlFor="registrationNumber">Medical License / Registration Number</label>
              <input
                id="registrationNumber"
                name="registrationNumber"
                type="text"
                placeholder="e.g. MCI-78291 / State Board ID"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="hospital">Hospital / Eye Institute</label>
              <input
                id="hospital"
                name="hospital"
                type="text"
                placeholder="e.g. St. Jude Eye Care Center"
                value={formData.hospital}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="specialization">Clinical Specialization</label>
              <select
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
              >
                <option value="Ophthalmology">General Ophthalmology</option>
                <option value="Vitreo-Retinal Specialist">Vitreo-Retinal Specialist</option>
                <option value="Medical Retina Fellow">Medical Retina Fellow</option>
                <option value="Optometrist">Clinical Optometrist</option>
              </select>
            </div>
          </div>

          {/* Verification */}
          <div className="form-section">
            <div className="form-section-title">Professional Verification</div>

            <div className="form-group">
              <label htmlFor="certificate">Medical Council Registration Certificate</label>
              <div className="file-upload">
                <input
                  id="certificate"
                  name="certificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCertificate(e.target.files[0])}
                />
                <span>
                  {certificate ? certificate.name : "Select license document (PDF, JPG, PNG)"}
                </span>
              </div>
              <small style={{ color: "#7c8995", marginTop: "4px", display: "block" }}>
                Optional for initial demo submission
              </small>
            </div>
          </div>

          {/* Security */}
          <div className="form-section">
            <div className="form-section-title">Account Security</div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️ Hide" : "👁️‍🗨️ Show"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-field">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
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
                  {showConfirmPassword ? "👁️ Hide" : "👁️‍🗨️ Show"}
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

            <label className="terms-checkbox">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />
              <span>I agree to the Clinical Terms & Teleophthalmology HIPAA/Privacy Policy</span>
            </label>
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={
              isSubmitting ||
              Boolean(
                formData.password &&
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword
              )
            }
          >
            {isSubmitting ? "Submitting Application..." : "Submit Doctor Registration →"}
          </button>

          <p className="login-link">
            Already have an account? <Link to="/login/ophthalmologist">Doctor Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}