import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/doctor.css";
import "../../styles/operator.css";

export default function PatientReviewPage() {
  const { patientId = "P-002" } = useParams();
  const navigate = useNavigate();

  const [clinicalDecision, setClinicalDecision] = useState("Agree with AI (Moderate DR)");
  const [treatmentPlan, setTreatmentPlan] = useState("Fluorescein angiography and 3-month follow-up recommended.");
  const [signed, setSigned] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.65);
  const [caseData, setCaseData] = useState({
    patient_id: patientId,
    patient_name: "Eleanor Vance",
    age: 54,
    gender: "Female",
    ai_grade: 2,
    confidence: 0.924,
    is_referable: true,
    fundus_image_url: null,
  });

  const session = JSON.parse(sessionStorage.getItem("user_session") || "null") || {
    name: "Dr. Sarah Jenkins, MD",
    title: "Vitreo-Retinal Specialist",
    license: "MCI-78291",
  };

  useEffect(() => {
    async function loadCase() {
      try {
        const data = await api.getScreenings();
        const found = (data.screenings || []).find(
          (s) => s.patient_id === patientId || String(s.scan_id) === patientId
        );
        if (found) {
          setCaseData({
            patient_id: found.patient_id || `P-${found.scan_id}`,
            patient_name: found.patient_name || "Patient Record",
            age: found.age || 54,
            gender: found.gender || "Female",
            ai_grade: found.ai_grade !== null ? found.ai_grade : 2,
            confidence: found.confidence || 0.924,
            is_referable: found.is_referable ?? true,
            fundus_image_url: found.fundus_image_url || null,
          });
        }
      } catch (err) {
        console.warn("Could not fetch case from API:", err.message);
      }
    }
    loadCase();
  }, [patientId]);

  const handleSignReport = (e) => {
    e.preventDefault();
    setSigned(true);
    setSuccessToast(true);
    setTimeout(() => {
      navigate("/doctor/reviews");
    }, 1800);
  };

  const gradeNames = [
    "No DR (Stage 0)",
    "Mild DR (Stage 1)",
    "Moderate DR (Stage 2)",
    "Severe DR (Stage 3)",
    "Proliferative DR (Stage 4)",
  ];

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

          <Link to="/doctor/reviews" className="doctor-nav-item">
            <span>📋</span>
            <span>Review Queue</span>
          </Link>

          <Link to={`/doctor/review/${patientId}`} className="doctor-nav-item active">
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

      {/* MAIN */}
      <main className="doctor-main">
        <header className="doctor-topbar">
          <div>
            <p className="doctor-page-label">CLINICAL VALIDATION & SIGN-OFF</p>
            <h1>Patient Case: {caseData.patient_id} ({caseData.patient_name})</h1>
          </div>

          <div className="doctor-user">
            <Link
              to="/doctor/reviews"
              className="operator-primary-button"
              style={{ background: "#e0f4f4", color: "#087f8c" }}
            >
              ← Back to Review Queue
            </Link>
          </div>
        </header>

        {successToast && (
          <div
            style={{
              background: "#ecfdf5",
              border: "1px solid #6ee7b7",
              color: "#065f46",
              padding: "16px 20px",
              borderRadius: "10px",
              fontSize: "14px",
              marginBottom: "20px",
              fontWeight: "600",
              boxShadow: "0 4px 12px rgba(16,185,129,0.15)",
            }}
          >
            ✓ Certified clinical report transmitted to screening center and electronic health record! Redirecting...
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", marginBottom: "30px" }}>
          {/* AI Evidence Card */}
          <div className="doctor-panel" style={{ padding: "24px", margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <span className="panel-label">IMAGE & AI GRAD-CAM EVIDENCE</span>
                <h3 style={{ margin: "4px 0 0" }}>Fundus Image & Attention Heatmap</h3>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  style={{ accentColor: "#087f8c" }}
                />
                Grad-CAM Heatmap
              </label>
            </div>

            <div
              style={{
                position: "relative",
                width: "100%",
                height: "280px",
                background: "#0c1524",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              {caseData.fundus_image_url ? (
                <img
                  src={caseData.fundus_image_url}
                  alt="Fundus"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "radial-gradient(circle at 55% 50%, #d85b1a 20%, #a83506 60%, #360e02 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      background: "#ffd88a",
                      borderRadius: "50%",
                      transform: "translate(70px, -20px)",
                      boxShadow: "0 0 16px rgba(255,216,138,0.7)",
                    }}
                  />
                </div>
              )}

              {showHeatmap && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: heatmapOpacity,
                    pointerEvents: "none",
                    background:
                      "radial-gradient(circle at 45% 55%, rgba(255,0,0,0.85) 0%, rgba(255,165,0,0.7) 25%, rgba(255,255,0,0.5) 45%, rgba(0,0,255,0.2) 70%, transparent 85%)",
                    mixBlendMode: "screen",
                  }}
                />
              )}

              <span
                style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "12px",
                  background: "rgba(0,0,0,0.7)",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                }}
              >
                Layer 4 Grad-CAM Overlay
              </span>
            </div>

            {/* Heatmap opacity slider */}
            {showHeatmap && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
                <span>Heatmap Opacity:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={heatmapOpacity}
                  onChange={(e) => setHeatmapOpacity(Number.parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: "#087f8c" }}
                />
                <strong>{Math.round(heatmapOpacity * 100)}%</strong>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "14px", borderRadius: "10px" }}>
              <div>
                <small style={{ color: "#64748b" }}>AI DR Severity Prediction</small>
                <p style={{ margin: "2px 0 0", fontWeight: "700", color: "#ea580c" }}>
                  {gradeNames[caseData.ai_grade] || "Moderate DR (Stage 2)"}
                </p>
              </div>
              <div>
                <small style={{ color: "#64748b" }}>Model Confidence Score</small>
                <p style={{ margin: "2px 0 0", fontWeight: "700", color: "#087f8c" }}>
                  {(caseData.confidence * 100).toFixed(1)}% (Concordant)
                </p>
              </div>
              <div>
                <small style={{ color: "#64748b" }}>Referral Recommendation</small>
                <p style={{ margin: "2px 0 0", fontWeight: "700", color: "#dc2626" }}>
                  Referable to Specialist
                </p>
              </div>
              <div>
                <small style={{ color: "#64748b" }}>Quality Assessment</small>
                <p style={{ margin: "2px 0 0", fontWeight: "700", color: "#16a34a" }}>
                  Adequate (Sharpness: 94%)
                </p>
              </div>
            </div>
          </div>

          {/* Doctor Assessment & Sign-Off Form */}
          <div className="doctor-panel" style={{ padding: "24px", margin: 0 }}>
            <span className="panel-label">OPHTHALMIC CLINICAL SIGN-OFF</span>
            <h3 style={{ margin: "8px 0 16px" }}>Physician Verification</h3>

            <form onSubmit={handleSignReport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>
                  Clinical Finding Agreement
                </label>
                <select
                  value={clinicalDecision}
                  onChange={(e) => setClinicalDecision(e.target.value)}
                  style={{ width: "100%", padding: "11px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                >
                  <option value="Agree with AI (Moderate DR)">✓ Concur with AI: Moderate DR (Stage 2)</option>
                  <option value="Reclassified to Severe DR">Reclassify to Severe DR (Stage 3)</option>
                  <option value="Reclassified to Mild DR">Reclassify to Mild Non-Proliferative DR (Stage 1)</option>
                  <option value="Normal / No DR">Override: Normal / No Clinically Significant DR</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>
                  Specialist Recommendations & Clinical Plan
                </label>
                <textarea
                  rows={4}
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                  placeholder="Enter medical directions..."
                  required
                />
              </div>

              <div style={{ background: "#f0fdfa", border: "1px solid #ccfbf1", borderRadius: "8px", padding: "12px", fontSize: "12px", color: "#115e59" }}>
                <strong>Digital Signature:</strong> {session.name} ({session.license || "MCI-78291"})
                <br />
                Timestamp: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </div>

              <button
                type="submit"
                className="doctor-primary-button"
                style={{ width: "100%", padding: "14px", fontSize: "14px", border: "none", cursor: "pointer" }}
                disabled={signed}
              >
                {signed ? "Signing & Transmitting..." : "Sign & Certify Clinical Report →"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
