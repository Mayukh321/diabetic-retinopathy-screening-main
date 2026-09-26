import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  SignIn,
  hasValidClerkKey,
  useUser,
  useClerk,
} from "../../components/auth/ClerkAuthWrapper";
import api from "../../services/api";
import "../../styles/auth.css";

function ClerkDatabaseSyncGate() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [deniedError, setDeniedError] = useState("");

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    let isMounted = true;
    async function verifyAccountInDatabase() {
      setChecking(true);
      const email = user.primaryEmailAddress?.emailAddress;

      if (!email) {
        setDeniedError("No email address provided by Clerk account.");
        await signOut();
        setChecking(false);
        return;
      }

      try {
        const response = await api.syncClerkUser({
          email,
          fullName: user.fullName || user.username || "Clinical User",
        });

        if (!isMounted) return;

        if (response && response.user) {
          const dbUser = response.user;
          // Store validated database session
          sessionStorage.setItem(
            "user_session",
            JSON.stringify({
              userId: dbUser.user_id,
              role: dbUser.role,
              title:
                dbUser.role === "doctor"
                  ? "Ophthalmologist"
                  : "Screening Operator",
              name: dbUser.full_name || "Clinical User",
              identifier: dbUser.email,
              centerId: dbUser.center_id || "SC-MAIN-001",
              license: dbUser.registration_number,
              specialization: dbUser.specialization,
              organization: dbUser.organization,
              authMethod: "clerk",
            })
          );

          if (dbUser.role === "doctor") {
            navigate("/doctor", { replace: true });
          } else {
            navigate("/operator", { replace: true });
          }
        } else {
          throw new Error("No database record returned.");
        }
      } catch (err) {
        if (!isMounted) return;
        // The user does NOT exist in the database! Sign them out immediately!
        await signOut();
        sessionStorage.removeItem("user_session");
        setDeniedError(
          err.message ||
            `Access Denied: The account "${email}" is not registered in the database. Uncreated accounts cannot log in.`
        );
      } finally {
        if (isMounted) setChecking(false);
      }
    }

    verifyAccountInDatabase();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, user, navigate, signOut]);

  if (checking) {
    return (
      <div className="auth-card" style={{ textAlign: "center", padding: "36px 24px" }}>
        <div className="spinner" style={{ margin: "0 auto 16px auto", width: "36px", height: "36px", border: "4px solid #e2e8f0", borderTopColor: "#1c9aa5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <h3 style={{ fontSize: "17px", color: "#1e293b", marginBottom: "8px" }}>
          Verifying Database Account...
        </h3>
        <p style={{ color: "#64748b", fontSize: "13px" }}>
          Checking whether your credentials exist in the clinical database.
        </p>
      </div>
    );
  }

  if (deniedError) {
    return (
      <div className="auth-card" style={{ textAlign: "center", padding: "32px 24px" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🚫</div>
        <h2 style={{ fontSize: "18px", color: "#dc2626", marginBottom: "10px", fontWeight: "700" }}>
          Login Denied: Account Not in Database
        </h2>
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "20px",
            lineHeight: "1.5",
          }}
        >
          {deniedError}
        </div>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
          Only accounts created and registered in the database are permitted to access this clinical platform.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link
            to="/register"
            className="auth-button"
            style={{ textAlign: "center", textDecoration: "none" }}
          >
            Register Operator Account →
          </Link>
          <Link
            to="/register/doctor"
            className="auth-button"
            style={{ textAlign: "center", textDecoration: "none", background: "#087f8c" }}
          >
            Register Doctor Account →
          </Link>
          <Link
            to="/login"
            style={{ color: "#64748b", fontSize: "13px", marginTop: "8px", textDecoration: "none" }}
          >
            ← Back to Standard Healthcare Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          width: "100%",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "10px 14px",
          fontSize: "12px",
          color: "#475569",
          marginBottom: "16px",
          textAlign: "center",
          lineHeight: "1.4",
        }}
      >
        🔒 <strong>Database Verification Active:</strong> Only registered clinical accounts in the PostgreSQL database will be granted access.
      </div>
      <SignIn
        routing="hash"
        signUpUrl="/clerk-register"
      />
      <div style={{ marginTop: "16px", textAlign: "center" }}>
        <Link to="/login" style={{ color: "#7c8995", fontSize: "13px", textDecoration: "none" }}>
          ← Switch to Standard Healthcare Login
        </Link>
      </div>
    </div>
  );
}

export default function ClerkSignInPage() {
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get("error");

  return (
    <div className="auth-page">
      <div style={{ maxWidth: "480px", width: "100%", margin: "0 auto" }}>
        {errorParam === "uncreated_account" && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            Access Denied: Uncreated accounts cannot log in.
          </div>
        )}

        {hasValidClerkKey ? (
          <ClerkDatabaseSyncGate />
        ) : (
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">◉</div>
              <h1>Clerk Authentication</h1>
              <p>Secure Healthcare Identity & Multi-Factor Access</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link to="/login/operator" className="auth-button" style={{ textAlign: "center", textDecoration: "none" }}>
                Use Standard Operator Login →
              </Link>
              <Link to="/login/ophthalmologist" className="auth-button" style={{ textAlign: "center", textDecoration: "none", background: "#087f8c" }}>
                Use Standard Doctor Login →
              </Link>
              <Link to="/" style={{ textAlign: "center", color: "#7c8995", fontSize: "13px", marginTop: "8px", textDecoration: "none" }}>
                ← Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
