import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ mode = "operator" }) {
  const location = useLocation();

  if (mode === "doctor") {
    return (
      <aside className="doctor-sidebar">
        <div className="doctor-logo">
          <span>◉</span>
          <strong>DR-Screen AI</strong>
          <span className="doctor-portal-pill">DOCTOR</span>
        </div>

        <nav className="doctor-nav">
          <Link
            to="/doctor"
            className={`doctor-nav-item ${location.pathname === "/doctor" ? "active" : ""}`}
          >
            <span>⌂</span>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/doctor/reviews"
            className={`doctor-nav-item ${location.pathname.startsWith("/doctor/review") ? "active" : ""}`}
          >
            <span>📋</span>
            <span>Review Queue</span>
          </Link>

          <Link
            to="/operator/explainability"
            className={`doctor-nav-item ${location.pathname === "/operator/explainability" ? "active" : ""}`}
          >
            <span>✦</span>
            <span>Explainability</span>
          </Link>
        </nav>

        <div className="doctor-sidebar-bottom">
          <Link to="/operator" className="doctor-nav-item">
            <span>⇆</span>
            <span>Operator Mode</span>
          </Link>

          <Link
            to="/login/ophthalmologist"
            className="doctor-nav-item logout"
            onClick={() => sessionStorage.removeItem("user_session")}
          >
            <span>↪</span>
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className="operator-sidebar">
      <div className="operator-logo">
        <span>◉</span>
        <strong>DR-Screen AI</strong>
      </div>

      <nav className="operator-nav">
        <Link
          to="/operator"
          className={`operator-nav-item ${location.pathname === "/operator" ? "active" : ""}`}
        >
          <span>⌂</span> Dashboard
        </Link>
        <Link
          to="/operator/new-screening"
          className={`operator-nav-item ${location.pathname === "/operator/new-screening" ? "active" : ""}`}
        >
          <span>＋</span> New Screening
        </Link>
        <Link
          to="/operator/screening"
          className={`operator-nav-item ${location.pathname === "/operator/screening" ? "active" : ""}`}
        >
          <span>👁️</span> Image Capture
        </Link>
        <Link
          to="/operator/history"
          className={`operator-nav-item ${location.pathname === "/operator/history" ? "active" : ""}`}
        >
          <span>▤</span> Screening History
        </Link>
        <Link
          to="/operator/reports"
          className={`operator-nav-item ${location.pathname === "/operator/reports" ? "active" : ""}`}
        >
          <span>▧</span> Reports
        </Link>
        <Link
          to="/operator/explainability"
          className={`operator-nav-item ${location.pathname === "/operator/explainability" ? "active" : ""}`}
        >
          <span>✦</span> Explainability
        </Link>
      </nav>

      <div className="operator-sidebar-bottom">
        <Link
          to="/operator/settings"
          className={`operator-nav-item ${location.pathname === "/operator/settings" ? "active" : ""}`}
        >
          <span>⚙</span> Settings
        </Link>
        <Link
          to="/login"
          className="operator-nav-item logout"
          onClick={() => sessionStorage.removeItem("user_session")}
        >
          <span>↪</span> Logout
        </Link>
      </div>
    </aside>
  );
}
