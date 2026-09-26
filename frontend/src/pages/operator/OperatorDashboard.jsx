import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { UserButton, SignedIn, hasValidClerkKey } from "../../components/auth/ClerkAuthWrapper";
import UserNavProfile from "../../components/layout/UserNavProfile";
import "../../styles/operator.css";

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // Retrieve user session or fallback
  const session = JSON.parse(sessionStorage.getItem("user_session") || "null") || {
    name: "Screening Operator",
    title: "Healthcare Professional",
    initials: "OP",
  };

  const gradeLabels = [
    "No DR",
    "Mild DR",
    "Moderate DR",
    "Severe DR",
    "Proliferative DR",
  ];

  useEffect(() => {
    async function loadScreenings() {
      try {
        const data = await api.getScreenings();
        setScreenings(data.screenings || []);
        setServerOnline(true);
      } catch (err) {
        console.warn("Could not fetch screenings from server:", err.message);
        setServerOnline(false);
      } finally {
        setLoading(false);
      }
    }
    loadScreenings();
  }, []);

  // Compute live statistics strictly from database data
  const totalCount = screenings.length;
  const referableCount = screenings.filter(
    (s) => s.is_referable === true || s.ai_grade >= 2
  ).length;
  const completedCount = screenings.filter((s) => s.status === "COMPLETED").length;
  const failedCount = screenings.filter((s) => s.status === "FAILED").length;

  // Actual backend database records only (no fake mock records)
  const displayList = screenings.slice(0, 8);

  return (
    <div className="operator-layout">
      {/* SIDEBAR */}
      <aside className="operator-sidebar">
        <div className="operator-logo">
          <span>◉</span>
          <strong>DR-Screen AI</strong>
        </div>

        <nav className="operator-nav">
          <Link to="/operator" className="operator-nav-item active">
            <span>⌂</span>
            Dashboard
          </Link>

          <Link to="/operator/new-screening" className="operator-nav-item">
            <span>＋</span>
            New Screening
          </Link>

          <Link to="/operator/history" className="operator-nav-item">
            <span>▤</span>
            Screening History
          </Link>

          <Link to="/operator/reports" className="operator-nav-item">
            <span>▧</span>
            Reports
          </Link>

          <Link to="/operator/explainability" className="operator-nav-item">
            <span>✦</span>
            Explainability
          </Link>
        </nav>

        <div className="operator-sidebar-bottom">
          <Link to="/operator/settings" className="operator-nav-item">
            <span>⚙</span>
            Settings
          </Link>

          <Link
            to="/login"
            className="operator-nav-item logout"
            onClick={() => sessionStorage.removeItem("user_session")}
          >
            <span>↪</span>
            Logout
          </Link>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="operator-main">
        {/* TOP BAR */}
        <header className="operator-topbar">
          <div>
            <p className="operator-page-label">SCREENING CENTER</p>
            <h1>Operator Dashboard</h1>
          </div>

          <div className="operator-user">
            {/* Server connection indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: serverOnline ? "#ecfdf5" : "#fef2f2",
                border: `1px solid ${serverOnline ? "#a7f3d0" : "#fecaca"}`,
                color: serverOnline ? "#065f46" : "#b91c1c",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "600",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: serverOnline ? "#10b981" : "#ef4444",
                }}
              />
              {serverOnline ? "Backend Connected" : "Backend Offline"}
            </div>

            <div
              className="notification"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ cursor: "pointer", position: "relative" }}
              title="Notifications"
            >
              🔔
              {referableCount > 0 && <span></span>}

              {showNotifications && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "36px",
                    width: "280px",
                    background: "white",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    border: "1px solid #e2e8f0",
                    padding: "14px",
                    zIndex: 100,
                    color: "#1e293b",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <strong style={{ fontSize: "13px", display: "block", marginBottom: "8px" }}>
                    Clinical Alerts
                  </strong>
                  {referableCount > 0 ? (
                    <div style={{ fontSize: "12px", color: "#dc2626", background: "#fef2f2", padding: "8px", borderRadius: "6px" }}>
                      ⚠️ {referableCount} referable diabetic retinopathy case(s) queued for doctor review.
                    </div>
                  ) : (
                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                      No unreviewed critical alerts.
                    </p>
                  )}
                </div>
              )}
            </div>

            {hasValidClerkKey && (
              <SignedIn>
                <div style={{ marginRight: "6px" }}>
                  <UserButton afterSignOutUrl="/login" />
                </div>
              </SignedIn>
            )}

            {/* Reactive Interactive User Profile Bar */}
            <UserNavProfile theme="operator" />
          </div>
        </header>

        {/* WELCOME */}
        <section className="operator-welcome">
          <div>
            <span className="welcome-label">TODAY'S OVERVIEW</span>
            <h2>Welcome back, {session.name ? session.name.split(" ")[0] : "Operator"}</h2>
            <p>
              Manage retinal screenings, monitor incoming AI inferences, and verify image capture quality.
            </p>
          </div>

          <Link to="/operator/new-screening" className="operator-primary-button">
            + Start New Screening
          </Link>
        </section>

        {/* STATISTICS */}
        <section className="operator-stats">
          <div className="operator-stat-card">
            <div className="stat-icon">◉</div>
            <div>
              <span>Total Screenings</span>
              <strong>{totalCount}</strong>
              <small>{totalCount === 1 ? "1 screening in database" : `${totalCount} records in database`}</small>
            </div>
          </div>

          <div className="operator-stat-card">
            <div className="stat-icon referable">!</div>
            <div>
              <span>Referable Cases</span>
              <strong>{referableCount}</strong>
              <small>{referableCount === 0 ? "0 cases require specialist review" : `${referableCount} specialist review needed`}</small>
            </div>
          </div>

          <div className="operator-stat-card">
            <div className="stat-icon quality">✓</div>
            <div>
              <span>Successful Screenings</span>
              <strong>{completedCount}</strong>
              <small>{completedCount === 0 ? "0 completed scans" : `${completedCount} AI diagnostic valid`}</small>
            </div>
          </div>

          <div className="operator-stat-card">
            <div className="stat-icon recapture">↻</div>
            <div>
              <span>Issues / Recapture</span>
              <strong>{failedCount}</strong>
              <small>{failedCount === 0 ? "0 capture errors" : `${failedCount} poor focus / artifacts`}</small>
            </div>
          </div>
        </section>

        {/* RECENT SCREENINGS */}
        <section className="operator-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">SCREENING ACTIVITY</span>
              <h2>Recent Screenings</h2>
            </div>

            <Link to="/operator/history">View All Records →</Link>
          </div>

          <div className="screening-table-wrapper">
            <table className="screening-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Date & Time</th>
                  <th>AI Predicted DR</th>
                  <th>Referral Status</th>
                  <th>Processing</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      <div className="spinner" style={{ margin: "0 auto 8px auto", width: "24px", height: "24px", border: "3px solid #e2e8f0", borderTopColor: "#0f766e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Loading patient screening records from database...
                    </td>
                  </tr>
                ) : displayList.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>📋</div>
                      <strong style={{ fontSize: "14px", color: "#1e293b", display: "block", marginBottom: "4px" }}>
                        No Patient Screenings in Database
                      </strong>
                      <p style={{ color: "#64748b", fontSize: "12px", margin: "0 auto 16px", maxWidth: "380px" }}>
                        There are currently no retinal scans recorded in the database. Perform a screening to see live AI diagnostic predictions.
                      </p>
                      <Link
                        to="/operator/new-screening"
                        className="operator-primary-button"
                        style={{ display: "inline-block", padding: "8px 18px", fontSize: "12px", textDecoration: "none" }}
                      >
                        + Start First Screening
                      </Link>
                    </td>
                  </tr>
                ) : (
                  displayList.map((screening) => {
                    const id = screening.scan_id || screening.id;
                    const grade = screening.ai_grade;
                    const isReferable =
                      screening.is_referable !== null && screening.is_referable !== undefined
                        ? screening.is_referable
                        : grade >= 2;
                    const dateStr = screening.created_at
                      ? new Date(screening.created_at).toLocaleString()
                      : "Today";

                    return (
                      <tr key={id}>
                        <td>
                          <strong>{screening.patient_id || `P-${id}`}</strong>
                          {screening.patient_name && (
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              {screening.patient_name}
                            </div>
                          )}
                        </td>

                        <td>{dateStr}</td>

                        <td>
                          <span className="dr-level">
                            {grade !== null && grade !== undefined
                              ? gradeLabels[grade] || `Grade ${grade}`
                              : screening.status === "PENDING"
                              ? "Analyzing..."
                              : "Pending Analysis"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              isReferable
                                ? "status-badge referable-status"
                                : "status-badge safe-status"
                            }
                          >
                            {isReferable ? "Referable" : "Non-Referable"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              screening.status === "COMPLETED"
                                ? "safe-status"
                                : screening.status === "FAILED"
                                ? "referable-status"
                                : "pending-status"
                            }`}
                          >
                            {screening.status || "COMPLETED"}
                          </span>
                        </td>

                        <td>
                          <button
                            className="view-button"
                            type="button"
                            onClick={() => navigate(`/operator/result?id=${id}`)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="quick-actions">
          <h2>Quick Operator Tools</h2>

          <div className="quick-action-grid">
            <Link to="/operator/new-screening" className="quick-action-card">
              <span>＋</span>
              <div>
                <strong>New Screening</strong>
                <p>Upload retinal fundus image & register patient</p>
              </div>
              <b>→</b>
            </Link>

            <Link to="/operator/history" className="quick-action-card">
              <span>▤</span>
              <div>
                <strong>Screening History</strong>
                <p>View complete log of scans with filter & search</p>
              </div>
              <b>→</b>
            </Link>

            <Link to="/operator/reports" className="quick-action-card">
              <span>▧</span>
              <div>
                <strong>Clinical Reports</strong>
                <p>Printable diagnostic reports & referral slips</p>
              </div>
              <b>→</b>
            </Link>

            <Link to="/operator/explainability" className="quick-action-card">
              <span>✦</span>
              <div>
                <strong>Explainability Suite</strong>
                <p>Grad-CAM heatmaps & retinal lesion analysis</p>
              </div>
              <b>→</b>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}