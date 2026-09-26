import { Link } from "react-router-dom";
import { SignUp, hasValidClerkKey } from "../../components/auth/ClerkAuthWrapper";
import "../../styles/auth.css";

export default function ClerkSignUpPage() {
  return (
    <div className="auth-page">
      <div style={{ maxWidth: "480px", width: "100%", margin: "0 auto" }}>
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "13px",
            color: "#92400e",
            marginBottom: "16px",
            lineHeight: "1.4",
            textAlign: "center",
          }}
        >
          ⚠️ <strong>Clinical Registration Required:</strong> Only users registered in the healthcare database are permitted to access the platform. Please complete registration below to create your official clinical profile.
        </div>

        {hasValidClerkKey ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <SignUp
              routing="hash"
              signInUrl="/clerk-login"
            />
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <Link to="/register" style={{ color: "#7c8995", fontSize: "13px", textDecoration: "none" }}>
                ← Switch to Standard Healthcare Registration
              </Link>
            </div>
          </div>
        ) : (
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">◉</div>
              <h1>Clinical Registration</h1>
              <p>Create an account in the DR-Screen AI clinical database</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link to="/register" className="auth-button" style={{ textAlign: "center", textDecoration: "none" }}>
                Register Operator Account →
              </Link>
              <Link to="/register/doctor" className="auth-button" style={{ textAlign: "center", textDecoration: "none", background: "#087f8c" }}>
                Register Doctor Account →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
