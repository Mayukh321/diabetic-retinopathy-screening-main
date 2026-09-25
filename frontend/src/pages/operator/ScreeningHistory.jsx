import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/operator.css";

export default function ScreeningHistory() {
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchScreenings() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/screenings`
        );
        const data = await response.json();
        if (response.ok) {
          setScreenings(data.screenings || []);
        } else {
          setError(data.error || "Failed to load screenings.");
        }
      } catch {
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    }
    fetchScreenings();
  }, []);

  const gradeLabels = [
    "No DR",
    "Mild DR",
    "Moderate DR",
    "Severe DR",
    "Proliferative DR",
  ];

  return (
    <div className="operator-layout">

      {/* SIDEBAR */}
      <aside className="operator-sidebar">
        <div className="operator-logo">
          <span>◉</span>
          <strong>DR-Screen AI</strong>
        </div>

        <nav className="operator-nav">
          <Link to="/operator" className="operator-nav-item">
            <span>⌂</span> Dashboard
          </Link>
          <Link to="/operator/new-screening" className="operator-nav-item">
            <span>＋</span> New Screening
          </Link>
          <Link to="/operator/history" className="operator-nav-item active">
            <span>▤</span> Screening History
          </Link>
          <Link to="/operator/reports" className="operator-nav-item">
            <span>▧</span> Reports
          </Link>
        </nav>

        <div className="operator-sidebar-bottom">
          <Link to="/operator/settings" className="operator-nav-item">
            <span>⚙</span> Settings
          </Link>
          <Link to="/login" className="operator-nav-item logout">
            <span>↪</span> Logout
          </Link>
        </div>
      </aside>


      {/* MAIN */}
      <main className="operator-main">

        <header className="operator-topbar">
          <div>
            <p className="operator-page-label">SCREENING CENTER</p>
            <h1>Screening History</h1>
          </div>
          <div className="operator-user">
            <div className="operator-avatar">OP</div>
            <div className="operator-user-info">
              <strong>Screening Operator</strong>
              <small>Healthcare Professional</small>
            </div>
          </div>
        </header>


        <section className="operator-panel">

          <div className="panel-header">
            <div>
              <span className="panel-label">ALL SCREENINGS</span>
              <h2>Complete Screening Record</h2>
            </div>
            <span style={{ color: "#84919d", fontSize: "12px" }}>
              {screenings.length} record{screenings.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading && (
            <div style={{ padding: "40px", textAlign: "center", color: "#84919d" }}>
              Loading screenings...
            </div>
          )}

          {error && (
            <div style={{
              padding: "16px 25px",
              background: "#fef2f2",
              color: "#b91c1c",
              fontSize: "13px",
            }}>
              {error}
            </div>
          )}

          {!loading && !error && screenings.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#84919d" }}>
              <p style={{ fontSize: "16px", marginBottom: "8px" }}>No screenings yet</p>
              <p style={{ fontSize: "13px" }}>Start a new screening to see records here.</p>
              <Link to="/operator/new-screening" className="operator-primary-button" style={{ display: "inline-block", marginTop: "16px" }}>
                + New Screening
              </Link>
            </div>
          )}

          {!loading && !error && screenings.length > 0 && (
            <div className="screening-table-wrapper">
              <table className="screening-table">
                <thead>
                  <tr>
                    <th>Screening ID</th>
                    <th>Patient</th>
                    <th>Age / Gender</th>
                    <th>Status</th>
                    <th>AI Result</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {screenings.map((s) => (
                    <tr key={s.scan_id}>
                      <td><strong>#{s.scan_id}</strong></td>
                      <td>{s.patient_name || "Unknown"}</td>
                      <td>{s.age || "—"} / {s.gender || "—"}</td>
                      <td>
                        <span className={`status-badge ${
                          s.status === "COMPLETED" ? "safe-status"
                          : s.status === "FAILED" ? "referable-status"
                          : "pending-status"
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <span className="dr-level">
                          {s.ai_grade !== null && s.ai_grade !== undefined
                            ? gradeLabels[s.ai_grade] || `Grade ${s.ai_grade}`
                            : "—"}
                        </span>
                      </td>
                      <td style={{ fontSize: "11px", color: "#84919d" }}>
                        {s.created_at ? new Date(s.created_at).toLocaleString() : "—"}
                      </td>
                      <td>
                        <button className="view-button" type="button">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </section>

      </main>
    </div>
  );
}
