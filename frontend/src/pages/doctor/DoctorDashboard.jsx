import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { UserButton, SignedIn, hasValidClerkKey } from "../../components/auth/ClerkAuthWrapper";
import UserNavProfile from "../../components/layout/UserNavProfile";
import "../../styles/doctor.css";
import "../../styles/operator.css";

export default function DoctorDashboard() {
  const [reviews, setReviews] = useState([]);
  const [dbScreenings, setDbScreenings] = useState([]);
  const [loading, setLoading] = useState(true);

  const session = JSON.parse(sessionStorage.getItem("user_session") || "null") || {
    name: "Dr. Sarah Jenkins, MD",
    title: "Vitreo-Retinal Specialist",
    license: "MCI-78291",
  };

  const gradeLabels = ["No DR", "Mild DR", "Moderate DR", "Severe DR", "Proliferative DR"];

  useEffect(() => {
    async function loadDoctorQueue() {
      try {
        const data = await api.getScreenings();
        const serverScans = data.screenings || [];
        setDbScreenings(serverScans);

        // Extract real referable cases strictly from the PostgreSQL database
        const dbReferrals = serverScans
          .filter((s) => s.is_referable || s.ai_grade >= 2)
          .map((s) => ({
            id: s.patient_id || `P-${s.scan_id}`,
            scan_id: s.scan_id,
            date: s.created_at ? new Date(s.created_at).toLocaleDateString() : "Today",
            time: s.created_at ? new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent",
            level: s.ai_grade !== null && s.ai_grade !== undefined ? `${gradeLabels[s.ai_grade]} (Stage ${s.ai_grade})` : "Moderate DR",
            confidence: s.confidence ? `${(s.confidence * 100).toFixed(1)}%` : "N/A",
            status: "Referable",
            priority: s.ai_grade === 4 ? "Critical" : "Urgent",
            lesions: s.ai_grade >= 3 ? "Extensive hemorrhages & IRMA" : "Microaneurysms, macular exudates",
          }));

        setReviews(dbReferrals);
      } catch (err) {
        console.warn("Could not load scans for doctor queue:", err.message);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    loadDoctorQueue();
  }, []);

  const urgentCount = reviews.filter((r) => r.priority === "Critical" || r.priority === "Urgent").length;

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
          <Link to="/doctor" className="doctor-nav-item active">
            <span>⌂</span>
            <span>Dashboard</span>
          </Link>

          <Link to="/doctor/reviews" className="doctor-nav-item">
            <span>📋</span>
            <span>Review Queue</span>
            <span className="nav-count-badge">{reviews.length}</span>
          </Link>

          <Link to={`/doctor/review/${reviews[0]?.id || "P-002"}`} className="doctor-nav-item">
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

      {/* MAIN CLINICAL AREA */}
      <main className="doctor-main">
        {/* TOPBAR */}
        <header className="doctor-topbar">
          <div>
            <p className="doctor-page-label">OPHTHALMIC CLINICAL SUITE</p>
            <h1>Doctor Review Dashboard</h1>
          </div>

          <div className="doctor-user">
            <div className="notification">
              🔔
              <span></span>
            </div>

            {hasValidClerkKey && (
              <SignedIn>
                <div style={{ marginRight: "6px" }}>
                  <UserButton afterSignOutUrl="/login/ophthalmologist" />
                </div>
              </SignedIn>
            )}

            {/* Reactive Interactive User Profile Bar */}
            <UserNavProfile theme="doctor" />
          </div>
        </header>

        {/* WELCOME BANNER */}
        <section className="doctor-welcome">
          <div>
            <span className="welcome-label">CLINICAL TRIAGE STATUS</span>
            <h2>Welcome back, {session.name ? session.name.split(" ")[0] : "Doctor"}</h2>
            <p>
              {reviews.length > 0
                ? `You have ${reviews.length} referable diabetic retinopathy case(s) in the database awaiting your clinical review.`
                : "All referable retinal screening cases in the database have been reviewed."}
            </p>
          </div>

          <Link to="/doctor/reviews" className="doctor-primary-button">
            Open Review Queue ({reviews.length}) →
          </Link>
        </section>

        {/* CLINICAL STATS */}
        <section className="doctor-stats">
          <div className="doctor-stat-card">
            <div className="stat-icon referable">!</div>
            <div>
              <span>Pending Reviews</span>
              <strong>{reviews.length}</strong>
              <small>{reviews.length === 0 ? "Queue completely clear" : "Requires clinical sign-off"}</small>
            </div>
          </div>

          <div className="doctor-stat-card">
            <div className="stat-icon" style={{ background: "#fff7ed", color: "#ea580c" }}>
              ⚡
            </div>
            <div>
              <span>Urgent / PDR</span>
              <strong>{urgentCount}</strong>
              <small>{urgentCount === 0 ? "No urgent cases" : "Critical referral cases"}</small>
            </div>
          </div>

          <div className="doctor-stat-card">
            <div className="stat-icon quality">✓</div>
            <div>
              <span>Database Scans</span>
              <strong>{dbScreenings.length}</strong>
              <small>Total patient records</small>
            </div>
          </div>

          <div className="doctor-stat-card">
            <div className="stat-icon" style={{ background: "#e0f4f4", color: "#087f8c" }}>
              ◉
            </div>
            <div>
              <span>Referral Ratio</span>
              <strong>
                {dbScreenings.length > 0
                  ? `${Math.round((reviews.length / dbScreenings.length) * 100)}%`
                  : "0%"}
              </strong>
              <small>Of all database screenings</small>
            </div>
          </div>
        </section>

        {/* PATIENT CASES TABLE */}
        <section className="doctor-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">ACTIVE CLINICAL QUEUE</span>
              <h2>Referred Patients Requiring Doctor Review</h2>
            </div>

            <Link to="/doctor/reviews">View All Cases ({reviews.length}) →</Link>
          </div>

          <div className="screening-table-wrapper">
            <table className="screening-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Screening Time</th>
                  <th>AI Predicted DR</th>
                  <th>Confidence</th>
                  <th>Key Lesion Findings</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      <div className="spinner" style={{ margin: "0 auto 8px auto", width: "24px", height: "24px", border: "3px solid #e2e8f0", borderTopColor: "#087f8c", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Loading referred cases from database...
                    </td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>🩺</div>
                      <strong style={{ fontSize: "14px", color: "#1e293b", display: "block", marginBottom: "4px" }}>
                        All Referrals Reviewed
                      </strong>
                      <p style={{ color: "#64748b", fontSize: "12px", margin: "0 auto", maxWidth: "380px" }}>
                        There are currently no referable diabetic retinopathy patient cases in the database awaiting doctor triage.
                      </p>
                    </td>
                  </tr>
                ) : (
                  reviews.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <strong>{patient.id}</strong>
                      </td>
                      <td>
                        {patient.date} <small style={{ color: "#94a3b8" }}>{patient.time}</small>
                      </td>
                      <td>
                        <span className="dr-level">{patient.level}</span>
                      </td>
                      <td>
                        <strong>{patient.confidence}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          {patient.lesions}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`priority-tag ${
                            patient.priority === "Critical"
                              ? "priority-urgent"
                              : patient.priority === "Urgent"
                              ? "priority-high"
                              : "priority-normal"
                          }`}
                        >
                          {patient.priority}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/doctor/review/${patient.id}`}
                          className="review-action-btn"
                        >
                          Review Case →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* QUICK CLINICAL ACTIONS */}
        <section className="quick-actions">
          <h2>Specialist Actions</h2>

          <div className="quick-action-grid">
            <Link to="/doctor/reviews" className="quick-action-card">
              <span>📋</span>
              <div>
                <strong>Examine Full Queue</strong>
                <p>Filter by DR severity, center ID, or urgency</p>
              </div>
              <b>→</b>
            </Link>

            <Link to="/operator/explainability" className="quick-action-card">
              <span>✦</span>
              <div>
                <strong>Grad-CAM Inspector</strong>
                <p>Verify neural network attention heatmaps</p>
              </div>
              <b>→</b>
            </Link>

            <Link to={`/doctor/review/${reviews[0]?.id || "P-002"}`} className="quick-action-card">
              <span>📑</span>
              <div>
                <strong>Digital Clinical Report</strong>
                <p>Sign off on clinical recommendations</p>
              </div>
              <b>→</b>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
