import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/operator.css";

export default function ScreeningHistory() {
  const navigate = useNavigate();
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [processingId, setProcessingId] = useState(null);

  const fetchScreenings = async () => {
    try {
      setLoading(true);
      const data = await api.getScreenings();
      setScreenings(data.screenings || []);
      setError("");
    } catch (err) {
      setError(err.message || "Could not connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenings();
  }, []);

  const handleProcessScan = async (scanId) => {
    setProcessingId(scanId);
    try {
      await api.processScreening(scanId);
      await new Promise((r) => setTimeout(r, 1200));
      await fetchScreenings();
    } catch (err) {
      alert(`Could not process scan #${scanId}: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const gradeLabels = [
    "No DR",
    "Mild DR",
    "Moderate DR",
    "Severe DR",
    "Proliferative DR",
  ];

  // Filtering
  const filteredScreenings = screenings.filter((s) => {
    const matchesSearch =
      (s.patient_id && s.patient_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.patient_name && s.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      String(s.scan_id).includes(searchTerm);

    if (!matchesSearch) return false;

    if (statusFilter === "REFERABLE") {
      return s.is_referable === true || s.ai_grade >= 2;
    }
    if (statusFilter === "NON_REFERABLE") {
      return s.is_referable === false || (s.ai_grade !== null && s.ai_grade < 2);
    }
    if (statusFilter === "PENDING") {
      return s.status === "PENDING";
    }
    if (statusFilter === "COMPLETED") {
      return s.status === "COMPLETED";
    }
    return true;
  });

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
            <p className="operator-page-label">SCREENING CENTER</p>
            <h1>Screening History & Records</h1>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              type="button"
              onClick={fetchScreenings}
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
              🔄 Refresh
            </button>

            <Link to="/operator/new-screening" className="operator-primary-button">
              + New Screening
            </Link>
          </div>
        </header>

        <section className="operator-panel">
          <div className="panel-header" style={{ flexWrap: "wrap", gap: "14px" }}>
            <div>
              <span className="panel-label">DATABASE ARCHIVE</span>
              <h2>All Patient Fundus Screenings</h2>
            </div>

            {/* Search & Filters */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Search patient ID or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  minWidth: "220px",
                }}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  background: "white",
                }}
              >
                <option value="ALL">All Cases ({screenings.length})</option>
                <option value="REFERABLE">Referable Only</option>
                <option value="NON_REFERABLE">Non-Referable Only</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending Analysis</option>
              </select>
            </div>
          </div>

          {loading && (
            <div style={{ padding: "50px", textAlign: "center", color: "#84919d" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  border: "3px solid #1c9aa5",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 12px",
                }}
              />
              Loading screening records from PostgreSQL database...
            </div>
          )}

          {error && (
            <div
              style={{
                margin: "20px 24px",
                padding: "16px 20px",
                background: "#fef2f2",
                color: "#b91c1c",
                fontSize: "13px",
                borderRadius: "8px",
                border: "1px solid #fecaca",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && filteredScreenings.length === 0 && (
            <div style={{ padding: "50px 20px", textAlign: "center", color: "#84919d" }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>📋</div>
              <p style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 6px", color: "#334155" }}>
                {screenings.length === 0 ? "No screening records in database" : "No matching screening records"}
              </p>
              <p style={{ fontSize: "13px", margin: "0 0 16px" }}>
                {screenings.length === 0
                  ? "Upload a retinal fundus photograph to initiate your first AI screening."
                  : "Try clearing your search query or filter."}
              </p>
              <Link to="/operator/new-screening" className="operator-primary-button" style={{ display: "inline-block" }}>
                + Start New Screening
              </Link>
            </div>
          )}

          {!loading && !error && filteredScreenings.length > 0 && (
            <div className="screening-table-wrapper">
              <table className="screening-table">
                <thead>
                  <tr>
                    <th>Screening ID</th>
                    <th>Patient</th>
                    <th>Demographics</th>
                    <th>Status</th>
                    <th>AI Predicted DR</th>
                    <th>Referral</th>
                    <th>Scan Timestamp</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScreenings.map((s) => {
                    const grade = s.ai_grade;
                    const isReferable =
                      s.is_referable !== null && s.is_referable !== undefined
                        ? s.is_referable
                        : grade >= 2;

                    return (
                      <tr key={s.scan_id}>
                        <td>
                          <strong>#{s.scan_id}</strong>
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
                          {s.age ? `${s.age}y` : "—"} / {s.gender || "—"}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              s.status === "COMPLETED"
                                ? "safe-status"
                                : s.status === "FAILED"
                                ? "referable-status"
                                : "pending-status"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td>
                          <span className="dr-level">
                            {grade !== null && grade !== undefined
                              ? gradeLabels[grade] || `Grade ${grade}`
                              : "Pending Analysis"}
                          </span>
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
                          {s.created_at ? new Date(s.created_at).toLocaleString() : "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              className="view-button"
                              type="button"
                              onClick={() => navigate(`/operator/result?id=${s.scan_id}`)}
                            >
                              View Report
                            </button>

                            {s.status !== "COMPLETED" && (
                              <button
                                type="button"
                                onClick={() => handleProcessScan(s.scan_id)}
                                disabled={processingId === s.scan_id}
                                style={{
                                  background: "#f0fdf4",
                                  border: "1px solid #86efac",
                                  color: "#166534",
                                  padding: "5px 9px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                }}
                              >
                                {processingId === s.scan_id ? "Running..." : "Run AI"}
                              </button>
                            )}
                          </div>
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
