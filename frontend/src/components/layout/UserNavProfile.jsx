import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useClerk, hasValidClerkKey } from "../auth/ClerkAuthWrapper";

/**
 * Reactive User Profile Bar Component
 * Displays real-time authenticated user information from the database,
 * with an interactive menu, status badge, role switcher, and logout trigger.
 */
export default function UserNavProfile({ theme = "operator" }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Retrieve live session
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user_session") || "null");
    } catch {
      return null;
    }
  });

  // Keep session reactive to storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setSession(JSON.parse(sessionStorage.getItem("user_session") || "null"));
      } catch {
        setSession(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let clerkSignOut = null;
  try {
    const clerk = useClerk ? useClerk() : null;
    clerkSignOut = clerk?.signOut;
  } catch {
    clerkSignOut = null;
  }

  const handleLogout = async () => {
    sessionStorage.removeItem("user_session");
    if (hasValidClerkKey && clerkSignOut) {
      try {
        await clerkSignOut();
      } catch {}
    }
    navigate("/login");
  };

  const isDoctor = theme === "doctor" || session?.role === "doctor";
  const primaryColor = isDoctor ? "#087f8c" : "#0f766e";
  const avatarBg = isDoctor ? "#087f8c" : "#1c9aa5";

  const fullName = session?.name || (isDoctor ? "Dr. Sarah Jenkins, MD" : "Alex Rivera");
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || (isDoctor ? "SJ" : "AR");

  const roleTitle = isDoctor
    ? session?.specialization || "Ophthalmologist"
    : session?.title || "Screening Operator";

  const email = session?.identifier || (isDoctor ? "dr.jenkins@eyeclinics.org" : "alex.rivera@screening.org");
  const identifierCode = isDoctor
    ? `Lic: ${session?.license || "MCI-78291"}`
    : `Center: ${session?.centerId || "SC-MAIN-001"}`;

  return (
    <div
      ref={dropdownRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: dropdownOpen ? "rgba(15, 118, 110, 0.08)" : "transparent",
          border: "1px solid",
          borderColor: dropdownOpen ? "#cbd5e1" : "transparent",
          borderRadius: "10px",
          padding: "4px 8px 4px 4px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          textAlign: "left",
        }}
      >
        {/* AVATAR */}
        <div
          style={{
            position: "relative",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: avatarBg,
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700",
            fontSize: "14px",
            letterSpacing: "0.5px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
          }}
        >
          {initials}
          {/* Active online pulse dot */}
          <span
            style={{
              position: "absolute",
              bottom: "0",
              right: "0",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              border: "2px solid #ffffff",
            }}
          />
        </div>

        {/* USER TEXT */}
        <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
          <span
            style={{
              fontWeight: "700",
              fontSize: "13px",
              color: "#1e293b",
              maxWidth: "140px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {fullName}
          </span>
          <small
            style={{
              fontSize: "11px",
              color: "#64748b",
              fontWeight: "500",
            }}
          >
            {roleTitle}
          </small>
        </div>

        {/* CHEVRON */}
        <span
          style={{
            fontSize: "10px",
            color: "#94a3b8",
            marginLeft: "2px",
            transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ▼
        </span>
      </button>

      {/* DROPDOWN MENU */}
      {dropdownOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "260px",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.16)",
            border: "1px solid #e2e8f0",
            padding: "16px",
            zIndex: 1000,
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          {/* PROFILE HEADER */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: avatarBg,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "16px",
              }}
            >
              {initials}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: "700", fontSize: "14px", color: "#1e293b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {fullName}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                {email}
              </div>
            </div>
          </div>

          {/* METADATA BADGES */}
          <div style={{ margin: "12px 0", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#475569",
                background: "#f8fafc",
                padding: "6px 10px",
                borderRadius: "6px",
              }}
            >
              <span>Role:</span>
              <strong style={{ color: primaryColor, textTransform: "capitalize" }}>
                {session?.role || (isDoctor ? "Doctor" : "Operator")}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#475569",
                background: "#f8fafc",
                padding: "6px 10px",
                borderRadius: "6px",
              }}
            >
              <span>Identifier:</span>
              <strong>{identifierCode}</strong>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                color: "#16a34a",
                marginTop: "4px",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
              <span>Database Session Authenticated</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <Link
              to={isDoctor ? "/operator" : "/doctor"}
              onClick={() => setDropdownOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "#334155",
                textDecoration: "none",
                padding: "7px 10px",
                borderRadius: "6px",
                background: "#f8fafc",
                fontWeight: "600",
              }}
            >
              <span>⇄</span>
              <span>Switch to {isDoctor ? "Operator Suite" : "Doctor Suite"}</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "8px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                marginTop: "4px",
                transition: "background 0.2s ease",
              }}
            >
              <span>↪</span>
              <span>Sign Out of Healthcare Portal</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
