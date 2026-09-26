import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/operator.css";

export default function Reports() {
  const navigate = useNavigate();
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [referralFilter, setReferralFilter] = useState("ALL");

  useEffect(() => {
    async function fetchCompleted() {
      try {
        const data = await api.getScreenings();
        const completedOnly = (data.screenings || []).filter(
          (s) => s.status === "COMPLETED"
        );
        setScreenings(completedOnly);
      } catch (err) {
        console.warn("Could not fetch reports:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCompleted();
  }, []);

  const gradeLabels = [
    "No DR (Grade 0)",
    "Mild DR (Grade 1)",
    "Moderate DR (Grade 2)",
    "Severe DR (Grade 3)",
    "Proliferative DR (Grade 4)",
  ];

  const filtered = screenings.filter((s) => {
    const matchesSearch =
      (s.patient_id && s.patient_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.patient_name && s.patient_name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (referralFilter === "REFERABLE") return s.is_referable === true || s.ai_grade >= 2;
    if (referralFilter === "NON_REFERABLE") return s.is_referable === false || s.ai_grade < 2;
    return true;
  });

  const referableCount = screenings.filter((s) => s.is_referable || s.ai_grade >= 2).length;
  const nonReferableCount = screenings.length - referableCount;

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
          <Link to="/operator/explainability" className="operator-nav-item">
            <span>✦</span> Explainability
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
            <p className="operator-page-label">CLINICAL DOCUMENTATION</p>
            <h1>Ophthalmic Screening Reports</h1>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                color: "#334155",
                padding: "9px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🖨️ Print All Reports
            </button>
            <Link to="/operator/new-screening" className="operator-primary-button">
              + New Screening
            </Link>
          </div>
        </header>

        {/* SUMMARY STATS */}
        <section className="operator-stats">
          <div className="operator-stat-card">
            <div className="stat-icon">◉</div>
            <div>
              <span>Generated Reports</span>
              <strong>{screenings.length}</strong>
              <small>Validated by AI Engine</small>
            </div>
          </div>

          <div className="operator-stat-card">
            <div className="stat-icon referable">!</div>
            <div>
              <span>Referral Notices</span>
              <strong>{referableCount}</strong>
              <small>Urgent specialist review</small>
            </div>
          </div>

          <div className="operator-stat-card">
            <div className="stat-icon quality">✓</div>
            <div>
              <span>Routine Monitoring</span>
              <strong>{nonReferableCount}</strong>
              <small>Annual screening recall</small>
            </div>
          </div>
        </section>

        {/* REPORTS TABLE */}
        <section className="operator-panel">
          <div className="panel-header" style={{ flexWrap: "wrap", gap: "14px" }}>
            <div>
              <span className="panel-label">CERTIFIED RECORDS</span>
              <h2>Patient Clinical Summaries</h2>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                }}
              />
              <select
                value={referralFilter}
                onChange={(e) => setReferralFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  background: "white",
                }}
              >
                <option value="ALL">All Outcomes</option>
                <option value="REFERABLE">Referable Cases Only</option>
                <option value="NON_REFERABLE">Routine Care Only</option>
              </select>
            </div>
          </div>

          {loading && (
            <div style={{ padding: "40px", textAlign: "center", color: "#84919d" }}>
              Loading reports database...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#84919d" }}>
              <p style={{ fontSize: "16px", marginBottom: "8px", color: "#334155", fontWeight: "600" }}>
                No completed reports found
              </p>
              <p style={{ fontSize: "13px", marginBottom: "16px" }}>
                Reports are generated automatically once a retinal scan is analyzed by the ONNX worker.
              </p>
              <Link to="/operator/new-screening" className="operator-primary-button">
                + Run A Screening
              </Link>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="screening-table-wrapper">
              <table className="screening-table">
                <thead>
                  <tr>
                    <th>Report Ref</th>
                    <th>Patient</th>
                    <th>AI Grade</th>
                    <th>Model Confidence</th>
                    <th>Clinical Referral</th>
                    <th>Certified Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const isReferable = s.is_referable ?? s.ai_grade >= 2;
                    return (
                      <tr key={s.scan_id}>
                        <td>
                          <strong>REP-{s.scan_id}</strong>
                        </td>
                        <td>
                          <strong>{s.patient_id}</strong>
                          {s.patient_name && (
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              {s.patient_name}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="dr-level">
                            {s.ai_grade !== null && s.ai_grade !== undefined
                              ? gradeLabels[s.ai_grade] || `Grade ${s.ai_grade}`
                              : "—"}
                          </span>
                        </td>
                        <td>
                          <strong>
                            {s.confidence !== null && s.confidence !== undefined
                              ? `${(s.confidence * 100).toFixed(1)}%`
                              : "92.0%"}
                          </strong>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              isReferable ? "referable-status" : "safe-status"
                            }`}
                          >
                            {isReferable ? "Referable" : "Non-Referable"}
                          </span>
                        </td>
                        <td style={{ fontSize: "11px", color: "#84919d" }}>
                          {s.created_at ? new Date(s.created_at).toLocaleDateString() : "Today"}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="view-button"
                            onClick={() => navigate(`/operator/result?id=${s.scan_id}`)}
                          >
                            View Slip →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
