import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute Guard
 * Ensures only users authenticated against the PostgreSQL database
 * can access protected application portals.
 */
export default function ProtectedRoute({ children, allowedRole }) {
  const location = useLocation();

  // Retrieve database session
  const sessionStr = sessionStorage.getItem("user_session");
  let session = null;
  try {
    session = sessionStr ? JSON.parse(sessionStr) : null;
  } catch {
    session = null;
  }

  // Not authenticated in database -> redirect to login
  if (!session || !session.userId) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // Check role authorization
  if (allowedRole && session.role !== allowedRole) {
    // If doctor attempts to access operator portal, or vice versa, redirect to authorized portal
    if (session.role === "doctor") {
      return <Navigate to="/doctor" replace />;
    } else if (session.role === "operator") {
      return <Navigate to="/operator" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}
