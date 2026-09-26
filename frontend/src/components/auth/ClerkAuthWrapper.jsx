import React, { useEffect } from "react";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  UserButton,
  useUser,
  useAuth,
  useClerk,
} from "@clerk/clerk-react";
import api from "../../services/api";

// Use configured env key or the user's Clerk test key
const ENV_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
export const PUBLISHABLE_KEY =
  (ENV_KEY && !ENV_KEY.includes("placeholder") ? ENV_KEY.trim() : null) ||
  "pk_test_ZGVsaWNhdGUtbXVsZS01OTY2LmNsZXJrLmFjY291bnRzLmRldiQ";

export const hasValidClerkKey = Boolean(
  PUBLISHABLE_KEY &&
  (PUBLISHABLE_KEY.startsWith("pk_test_") || PUBLISHABLE_KEY.startsWith("pk_live_"))
);

class ClerkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Clerk Authentication error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#334155" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔐</div>
          <h3>Clerk Authentication Notice</h3>
          <p style={{ maxWidth: "480px", margin: "8px auto 20px", fontSize: "14px", color: "#64748b" }}>
            {this.state.error?.message || "Could not load Clerk components. You can continue using standard healthcare login."}
          </p>
          <a
            href="/login"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "#1c9aa5",
              color: "#ffffff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Go to Standard Login →
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Global security watcher that ensures any user signed in via Clerk
 * actually exists in the PostgreSQL database. If they do not exist,
 * it immediately signs them out and redirects to /login with an error.
 */
function ClerkGlobalSecurityWatcher() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      const existingSession = JSON.parse(sessionStorage.getItem("user_session") || "null");
      if (existingSession && existingSession.authMethod === "clerk") {
        sessionStorage.removeItem("user_session");
      }
      return;
    }

    let active = true;
    async function verifyWithDatabase() {
      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) return;

      const currentSession = JSON.parse(sessionStorage.getItem("user_session") || "null");
      if (currentSession && currentSession.identifier?.toLowerCase() === email.toLowerCase() && currentSession.userId) {
        return;
      }

      try {
        const result = await api.syncClerkUser({
          email,
          fullName: user.fullName || user.username || "Clinical User",
        });

        if (!active) return;

        if (result && result.user) {
          const dbUser = result.user;
          sessionStorage.setItem(
            "user_session",
            JSON.stringify({
              userId: dbUser.user_id,
              role: dbUser.role,
              title: dbUser.role === "doctor" ? "Ophthalmologist" : "Screening Operator",
              name: dbUser.full_name || "Clinical User",
              identifier: dbUser.email,
              centerId: dbUser.center_id || "SC-MAIN-001",
              license: dbUser.registration_number,
              specialization: dbUser.specialization,
              organization: dbUser.organization,
              authMethod: "clerk",
            })
          );
        }
      } catch (err) {
        if (!active) return;
        console.warn("Uncreated Clerk account detected in database. Forcing sign-out:", email);
        try {
          await signOut();
        } catch {}
        sessionStorage.removeItem("user_session");
        window.location.href = `/login?error=uncreated_account&denied_email=${encodeURIComponent(email)}`;
      }
    }

    verifyWithDatabase();

    return () => {
      active = false;
    };
  }, [isLoaded, isSignedIn, user, signOut]);

  return null;
}

export function ClerkAuthWrapper({ children }) {
  if (!hasValidClerkKey) {
    return <>{children}</>;
  }

  return (
    <ClerkErrorBoundary>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
        appearance={{
          variables: {
            colorPrimary: "#1c9aa5",
            colorText: "#1e293b",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "10px",
          },
          elements: {
            card: {
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              border: "1px solid #e2e8f0",
            },
            formButtonPrimary: {
              backgroundColor: "#1c9aa5",
              "&:hover": {
                backgroundColor: "#147b84",
              },
            },
          },
        }}
      >
        <ClerkGlobalSecurityWatcher />
        {children}
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
}

export {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  UserButton,
  useUser,
  useAuth,
  useClerk,
};
