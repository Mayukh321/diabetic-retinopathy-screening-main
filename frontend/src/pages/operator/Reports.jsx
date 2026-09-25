import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/operator.css";

export default function Reports() {
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompleted() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/screenings`
        );
        const data = await response.json();
        if (response.ok) {
          setScreenings(
            (data.screenings || []).filter((s) => s.status === "COMPLETED")
          );
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    fetchCompleted();
  }, []);

  const gradeLabels = ["No DR", "Mild DR", "Moderate DR", "Severe DR", "Proliferative DR"];

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
          <Link to="/operator/history" className="operator-nav-item">
            <span>▤</span> Screening History
          </Link>
          <Link to="/operator/reports" className="operator-nav-item active">
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
            <h1>Reports</h1>
          </div>
          <div className="operator-user">
            <div className="operator-avatar">OP</div>
            <div className="operator-user-info">
              <strong>Screening Operator</strong>
              <small>Healthcare Professional</small>
            </div>
          </div>
        </header>


        {/* SUMMARY STATS */}
        <section className="operator-stats">
          <div className="operator-stat-card">
            <div className="stat-icon">◉</div>
            <div>
              <span>Completed Reports</span>
              <strong>{screenings.length}</strong>
              <small>Total analyzed</small>
            </div>
          </div>

          <div className="operator-stat-card">
            <div className="stat-icon referable">!</div>
            <div>
              <span>Referable</span>
              <strong>{screenings.filter((s) => s.is_referable).length}</strong>
              <small>Need specialist review</small>
            </div>
          </div>

          <div className="operator-stat-card">
            <div className="stat-icon quality">✓</div>
            <div>
              <span>Non-Referable</span>
              <strong>{screenings.filter((s) => !s.is_referable).length}</strong>
              <small>No DR or mild</small>
            </div>
          </div>
        </section>


        {/* REPORTS TABLE */}
        <section className="operator-panel">

          <div className="panel-header">
            <div>
              <span className="panel-label">AI SCREENING REPORTS</span>
              <h2>Completed Screenings</h2>
            </div>
          </div>

          {loading && (
            <div style={{ padding: "40px", textAlign: "center", color: "#84919d" }}>
              Loading reports...
            </div>
          )}

          {!loading && screenings.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#84919d" }}>
              <p style={{ fontSize: "16px", marginBottom: "8px" }}>No completed reports yet</p>
              <p style={{ fontSize: "13px" }}>Reports will appear here once screenings are processed.</p>
            </div>
          )}

          {!loading && screenings.length > 0 && (
            <div className="screening-table-wrapper">
              <table className="screening-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>AI Grade</th>
                    <th>Confidence</th>
                    <th>Referral</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {screenings.map((s) => (
                    <tr key={s.scan_id}>
                      <td><strong>#{s.scan_id}</strong></td>
                      <td>{s.patient_name || "Unknown"}</td>
                      <td>
                        <span className="dr-level">
                          {s.ai_grade !== null && s.ai_grade !== undefined
                            ? gradeLabels[s.ai_grade] || `Grade ${s.ai_grade}`
                            : "—"}
                        </span>
                      </td>
                      <td>
                        {s.confidence !== null && s.confidence !== undefined
                          ? `${(s.confidence * 100).toFixed(1)}%`
                          : "—"}
                      </td>
                      <td>
                        <span className={`status-badge ${s.is_referable ? "referable-status" : "safe-status"}`}>
                          {s.is_referable ? "Referable" : "Non-Referable"}
                        </span>
                      </td>
                      <td style={{ fontSize: "11px", color: "#84919d" }}>
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
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
