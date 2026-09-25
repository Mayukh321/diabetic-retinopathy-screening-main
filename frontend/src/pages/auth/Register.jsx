import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.terms) {
      setError("Please agree to the Terms of Use and Privacy Policy.");
      return;
    }

    // Navigate to pending or login after registration
    navigate("/registration-pending");
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-header">
          <div className="auth-logo">◉</div>
          <h1>Create Professional Account</h1>
          <p>
            Request access to the DR-Screen AI platform
          </p>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
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
              placeholder="Enter your email"
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
              placeholder="Enter your phone number"
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
              placeholder="Enter organization name"
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
              placeholder="Enter center ID"
              value={formData.centerId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <label className="terms-checkbox">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
            />
            <span>
              I agree to the Terms of Use and Privacy Policy.
            </span>
          </label>

          <button type="submit" className="auth-button">
            Request Access →
          </button>

        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>

        <div className="auth-footer">
          <span>Ophthalmologist?</span>
          <Link to="/register/doctor">Register as Doctor →</Link>
        </div>

      </div>

    </div>
  );
}