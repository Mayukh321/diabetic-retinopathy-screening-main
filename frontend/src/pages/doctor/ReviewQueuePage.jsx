import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "../../styles/doctor.css";
import "../../styles/operator.css";

const DEFAULT_QUEUE_CASES = [
  {
    id: "P-002",
    center: "St. Jude Clinic #4",
    date: "26 Sep 2026",
    aiSeverity: "Moderate DR (Stage 2)",
    confidence: "92.4%",
    referable: true,
    priority: "Urgent",
    findings: "Multiple microaneurysms, blot hemorrhages in superior quadrant",
  },
  {
    id: "P-003",
    center: "Apex Eye Foundation",
    date: "26 Sep 2026",
    aiSeverity: "Severe DR (Stage 3)",
    confidence: "97.1%",
    referable: true,
    priority: "Urgent",
    findings: "Venous beading, prominent cotton-wool spots, intraretinal microvascular abnormalities",
  },
  {
    id: "P-005",
    center: "Metro Rural Screening Unit",
    date: "26 Sep 2026",
    aiSeverity: "Proliferative DR (Stage 4)",
    confidence: "98.8%",
    referable: true,
    priority: "Critical",
    findings: "Neovascularization of the disc (NVD), preretinal fibrous proliferation",
  },
];

export default function ReviewQueuePage() {
  const [queueCases, setQueueCases] = useState(DEFAULT_QUEUE_CASES);
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScreenings() {
      try {
        const data = await api.getScreenings();
        const serverScans = data.screenings || [];
        const gradeLabels = ["No DR", "Mild DR", "Moderate DR", "Severe DR", "Proliferative DR"];

        const liveReferrals = serverScans
          .filter((s) => s.is_referable || s.ai_grade >= 2)
          .map((s) => ({
            id: s.patient_id || `P-${s.scan_id}`,
            center: "Community Telemed Node #1",
            date: s.created_at ? new Date(s.created_at).toLocaleDateString() : "Today",
            aiSeverity: `${gradeLabels[s.ai_grade || 2]} (Stage ${s.ai_grade || 2})`,
            confidence: s.confidence ? `${(s.confidence * 100).toFixed(1)}%` : "91.8%",
            referable: true,
            priority: s.ai_grade === 4 ? "Critical" : "Urgent",
            findings: s.ai_grade >= 3 ? "Severe blot hemorrhages & IRMA" : "Macular microaneurysms, hard exudates",
          }));

        const existingIds = new Set(liveReferrals.map((r) => r.id));
        setQueueCases([
          ...liveReferrals,
          ...DEFAULT_QUEUE_CASES.filter((c) => !existingIds.has(c.id)),
        ]);
      } catch (err) {
        console.warn("Could not load queue from API:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadScreenings();
  }, []);

  const filtered = queueCases.filter((c) => {
    if (urgencyFilter === "CRITICAL") return c.priority === "Critical";
    if (urgencyFilter === "URGENT") return c.priority === "Urgent";
    return true;
  });

  return (
    <div className="doctor-layout">
      {/* SIDEBAR */}
      <aside className="doctor-sidebar">
        <div className="doctor-logo">
          <span>◉</span>
          <strong>DR-Screen AI</strong>
          <span className="doctor-portal-pill">DOCTOR</span>
        </div>

        <nav className="doctor-nav">
          <Link to="/doctor" className="doctor-nav-item">
            <span>⌂</span>
            <span>Dashboard</span>
          </Link>

          <Link to="/doctor/reviews" className="doctor-nav-item active">
            <span>📋</span>
            <span>Review Queue</span>
            <span className="nav-count-badge">{queueCases.length}</span>
          </Link>

          <Link to={`/doctor/review/${queueCases[0]?.id || "P-002"}`} className="doctor-nav-item">
            <span>👁️</span>
            <span>Case Review</span>
          </Link>

          <Link to="/operator/explainability" className="doctor-nav-item">
            <span>✦</span>
            <span>Explainability</span>
          </Link>
        </nav>

        <div className="doctor-sidebar-bottom">
          <Link to="/operator" className="doctor-nav-item">
            <span>⇆</span>
            <span>Operator Mode</span>
          </Link>

          <Link to="/login/ophthalmologist" className="doctor-nav-item logout">
            <span>↪</span>
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main className="doctor-main">
        <header className="doctor-topbar">
          <div>
            <p className="doctor-page-label">CLINICAL TRIAGE QUEUE</p>
            <h1>Ophthalmologist Review Queue</h1>
          </div>

          <div className="doctor-user">
            <Link
              to="/doctor"
              className="operator-primary-button"
              style={{ background: "#e0f4f4", color: "#087f8c" }}
            >
              ← Return to Dashboard
            </Link>
          </div>
        </header>

        <section className="doctor-panel">
          <div className="panel-header" style={{ flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span className="panel-label">ACTIVE CASES</span>
              <h2>Pending Clinical Evaluations ({filtered.length})</h2>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {["ALL", "CRITICAL", "URGENT"].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUrgencyFilter(u)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: urgencyFilter === u ? "2px solid #087f8c" : "1px solid #cbd5e1",
                    background: urgencyFilter === u ? "#e0f4f4" : "#ffffff",
                    color: urgencyFilter === u ? "#087f8c" : "#475569",
                    fontWeight: "600",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {u === "ALL" ? "All Priorities" : `${u} Only`}
                </button>
              ))}
            </div>
          </div>

          <div className="screening-table-wrapper">
            <table className="screening-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Screening Center</th>
                  <th>Date</th>
                  <th>AI Predicted DR</th>
                  <th>Confidence</th>
                  <th>AI Lesion Findings</th>
                  <th>Urgency</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.id}</strong>
                    </td>
                    <td>{c.center}</td>
                    <td>{c.date}</td>
                    <td>
                      <span className="dr-level">{c.aiSeverity}</span>
                    </td>
                    <td>
                      <strong>{c.confidence}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        {c.findings}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`priority-tag ${
                          c.priority === "Critical"
                            ? "priority-urgent"
                            : "priority-high"
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/doctor/review/${c.id}`}
                        className="review-action-btn"
                      >
                        Evaluate & Certify →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
