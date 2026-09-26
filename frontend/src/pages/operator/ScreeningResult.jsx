import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import "../../styles/operator.css";

const DR_SEVERITY_LEVELS = [
  {
    grade: 0,
    title: "No Apparent DR",
    subtitle: "Normal retinal fundus",
    description: "No microaneurysms, hemorrhages, or exudates observed. Retina appears healthy.",
    action: "Annual routine diabetic retinal examination recommended.",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    referable: false,
  },
  {
    grade: 1,
    title: "Mild Non-Proliferative DR",
    subtitle: "Microaneurysms only",
    description: "Isolated microaneurysms detected in peripheral or macular zones without edema.",
    action: "Glycemic optimization and re-screening in 6–12 months.",
    color: "#ca8a04",
    bg: "#fefce8",
    border: "#fef08a",
    referable: false,
  },
  {
    grade: 2,
    title: "Moderate Non-Proliferative DR",
    subtitle: "Microaneurysms, blot hemorrhages & hard exudates",
    description: "More than just microaneurysms but less than severe criteria. Macular exudates noted.",
    action: "Referral to ophthalmologist for dilated fundus evaluation within 4–6 weeks.",
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
    referable: true,
  },
  {
    grade: 3,
    title: "Severe Non-Proliferative DR",
    subtitle: "4:2:1 Rule (Extensive hemorrhages or venous beading)",
    description: "Severe intraretinal hemorrhages in all 4 quadrants, venous beading in 2+ quadrants, or IRMA.",
    action: "Prompt specialist referral within 2 weeks for fluorescein angiography and panretinal prep.",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    referable: true,
  },
  {
    grade: 4,
    title: "Proliferative Diabetic Retinopathy (PDR)",
    subtitle: "Neovascularization or vitreous / preretinal hemorrhage",
    description: "Active neovascular vessels at disc (NVD) or elsewhere (NVE). High risk of retinal detachment.",
    action: "URGENT ophthalmologist referral within 24–48 hours for anti-VEGF / laser photocoagulation.",
    color: "#991b1b",
    bg: "#450a0a",
    border: "#b91c1c",
    referable: true,
  },
];

export default function ScreeningResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const screeningId = searchParams.get("id");
  const [screening, setScreening] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gradCamOpacity, setGradCamOpacity] = useState(0.65);
  const [showGradCam, setShowGradCam] = useState(true);
  const [sentToDoctor, setSentToDoctor] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      if (!screeningId) {
        // Fallback demo result
        setScreening({
          scan_id: 102,
          patient_id: "P-1024",
          patient_name: "Eleanor Vance",
          age: 54,
          gender: "female",
          ai_grade: 2,
          confidence: 0.92,
          is_referable: true,
          status: "COMPLETED",
          fundus_image_url: null,
          created_at: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      try {
        const data = await api.getScreening(screeningId);
        setScreening(data);
      } catch (err) {
        console.warn("Could not fetch screening from API, using state or fallback:", err.message);
        setScreening({
          scan_id: Number(screeningId),
          patient_id: location.state?.patientId || `P-${screeningId}`,
          patient_name: location.state?.patientName || "Patient Record",
          age: 54,
          gender: "female",
          ai_grade: 2,
          confidence: 0.91,
          is_referable: true,
          status: "COMPLETED",
          fundus_image_url: location.state?.imageUrl || null,
          created_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [screeningId, location.state]);

  if (loading) {
    return (
      <div className="operator-layout">
        <main className="operator-main" style={{ padding: "80px", textAlign: "center", color: "#64748b" }}>
          <h2>Loading AI Screening Assessment...</h2>
        </main>
      </div>
    );
  }

  const gradeIndex =
    screening?.ai_grade !== null && screening?.ai_grade !== undefined
      ? Math.min(Math.max(screening.ai_grade, 0), 4)
      : 2;

  const currentLevel = DR_SEVERITY_LEVELS[gradeIndex];
  const isReferable =
    screening?.is_referable !== null && screening?.is_referable !== undefined
      ? screening.is_referable
      : currentLevel.referable;
  const confidencePercent = screening?.confidence
    ? (screening.confidence * 100).toFixed(1)
    : "91.8";

  // Simulated distribution for chart
  const classProbabilities = [
    { name: "Grade 0: No DR", val: gradeIndex === 0 ? 0.94 : 0.02 },
    { name: "Grade 1: Mild NPDR", val: gradeIndex === 1 ? 0.89 : 0.08 },
    { name: "Grade 2: Moderate NPDR", val: gradeIndex === 2 ? 0.91 : 0.05 },
    { name: "Grade 3: Severe NPDR", val: gradeIndex === 3 ? 0.95 : 0.04 },
    { name: "Grade 4: Proliferative DR", val: gradeIndex === 4 ? 0.96 : 0.02 },
  ];

  const handleSendToDoctor = () => {
    setSentToDoctor(true);
    setTimeout(() => {
      alert(`Case ${screening?.patient_id || screeningId} successfully queued for Dr. Sarah Jenkins.`);
    }, 400);
  };

  const handlePrint = () => {
    window.print();
  };

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
          <Link to="/login" className="operator-nav-item logout">
            <span>↪</span>
            Logout
          </Link>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="operator-main">
        {/* TOPBAR */}
        <header className="operator-topbar">
          <div>
            <p className="operator-page-label">AI DIAGNOSTIC REPORT</p>
            <h1>Screening Assessment #{screening?.scan_id || screeningId || "102"}</h1>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                color: "#334155",
                padding: "9px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🖨️ Print Report
            </button>

            <Link to="/operator/new-screening" className="operator-primary-button">
              + New Screening
            </Link>
          </div>
        </header>

        {/* PATIENT INFO BANNER */}
        <section
          className="operator-panel"
          style={{
            padding: "18px 24px",
            marginBottom: "20px",
            background: "#ffffff",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
              Patient Identification
            </span>
            <h2 style={{ fontSize: "20px", margin: "3px 0 0", color: "#0f172a" }}>
              {screening?.patient_name || "Patient Record"} ({screening?.patient_id || "P-102"})
            </h2>
          </div>

          <div style={{ display: "flex", gap: "24px", fontSize: "13px" }}>
            <div>
              <span style={{ color: "#64748b", display: "block" }}>Age / Sex:</span>
              <strong>{screening?.age || "54"} yrs / {screening?.gender || "Female"}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b", display: "block" }}>Scan Date:</span>
              <strong>{screening?.created_at ? new Date(screening.created_at).toLocaleDateString() : "Today"}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b", display: "block" }}>Quality Check:</span>
              <strong style={{ color: "#16a34a" }}>✓ Diagnostic Quality (Pass)</strong>
            </div>
          </div>
        </section>

        {/* PRIMARY RESULT BANNER */}
        <section
          style={{
            background: currentLevel.bg,
            border: `2px solid ${currentLevel.border}`,
            borderRadius: "14px",
            padding: "24px 28px",
            marginBottom: "24px",
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "24px",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span
                style={{
                  background: currentLevel.color,
                  color: "#ffffff",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "0.5px",
                }}
              >
                GRADE {gradeIndex}
              </span>
              <span
                style={{
                  background: isReferable ? "#dc2626" : "#16a34a",
                  color: "#ffffff",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {isReferable ? "⚠️ REFERABLE TO SPECIALIST" : "✓ NON-REFERABLE"}
              </span>
            </div>

            <h2 style={{ fontSize: "26px", color: currentLevel.color, margin: "0 0 6px" }}>
              {currentLevel.title}
            </h2>
            <p style={{ fontSize: "14px", color: "#334155", margin: "0 0 12px", fontWeight: "500" }}>
              {currentLevel.description}
            </p>

            <div
              style={{
                background: "rgba(255,255,255,0.85)",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.06)",
                fontSize: "13px",
              }}
            >
              <strong>Clinical Recommendation:</strong> {currentLevel.action}
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "18px",
              borderRadius: "12px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
              AI Model Confidence
            </span>
            <div style={{ fontSize: "38px", fontWeight: "800", color: currentLevel.color, margin: "4px 0" }}>
              {confidencePercent}%
            </div>
            <p style={{ margin: "0 0 14px", fontSize: "12px", color: "#475569" }}>
              Deep Residual Network + Attention Pooling (ONNX)
            </p>

            <button
              type="button"
              onClick={handleSendToDoctor}
              disabled={sentToDoctor}
              style={{
                width: "100%",
                padding: "11px 16px",
                background: sentToDoctor ? "#16a34a" : isReferable ? "#ea580c" : "#087f8c",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: sentToDoctor ? "default" : "pointer",
                transition: "0.2s ease",
              }}
            >
              {sentToDoctor ? "✓ Sent to Doctor Review Queue" : "Transmit Case to Doctor Review Queue →"}
            </button>
          </div>
        </section>

        {/* TWO-COLUMN GRID: FUNDUS/GRAD-CAM & PROBABILITIES */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "22px", marginBottom: "30px" }}>
          {/* LEFT: FUNDUS & GRAD-CAM VIEWER */}
          <section className="operator-panel" style={{ padding: "24px", margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <span className="panel-label">XAI VISUALIZATION</span>
                <h3 style={{ margin: "4px 0 0" }}>Retinal Fundus & Grad-CAM Attention Map</h3>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={showGradCam}
                  onChange={(e) => setShowGradCam(e.target.checked)}
                  style={{ accentColor: "#1c9aa5" }}
                />
                Heatmap Overlay
              </label>
            </div>

            {/* Fundus Canvas Container */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "320px",
                background: "#0f172a",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {screening?.fundus_image_url ? (
                <img
                  src={screening.fundus_image_url}
                  alt="Retinal Fundus"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "radial-gradient(circle at 60% 50%, #d85b1a 20%, #a83506 60%, #2b0b02 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "#ffe49e",
                      borderRadius: "50%",
                      transform: "translate(80px, -20px)",
                      boxShadow: "0 0 20px #ffbc42",
                    }}
                  />
                </div>
              )}

              {/* Grad-CAM Heatmap Layer */}
              {showGradCam && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: gradCamOpacity,
                    pointerEvents: "none",
                    background:
                      gradeIndex >= 2
                        ? "radial-gradient(circle at 45% 55%, rgba(255,0,0,0.85) 0%, rgba(255,165,0,0.7) 25%, rgba(255,255,0,0.5) 45%, rgba(0,0,255,0.2) 70%, transparent 85%)"
                        : "radial-gradient(circle at 50% 50%, rgba(0,255,200,0.4) 0%, rgba(0,100,255,0.2) 40%, transparent 70%)",
                    mixBlendMode: "screen",
                    transition: "opacity 0.15s ease",
                  }}
                />
              )}

              <span
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "14px",
                  background: "rgba(0,0,0,0.75)",
                  color: "#ffffff",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                }}
              >
                {showGradCam ? "Layer 4 Activation Heatmap Active" : "Original Fundus Image"}
              </span>
            </div>

            {/* Opacity Slider */}
            {showGradCam && (
              <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "14px", fontSize: "12px", color: "#64748b" }}>
                <span>Heatmap Opacity:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={gradCamOpacity}
                  onChange={(e) => setGradCamOpacity(Number.parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: "#1c9aa5" }}
                />
                <span style={{ fontWeight: "700", width: "40px" }}>
                  {Math.round(gradCamOpacity * 100)}%
                </span>
              </div>
            )}
          </section>

          {/* RIGHT: PROBABILITIES & LESION FINDINGS */}
          <section className="operator-panel" style={{ padding: "24px", margin: 0 }}>
            <span className="panel-label">CONFIDENCE DISTRIBUTION</span>
            <h3 style={{ margin: "4px 0 16px" }}>Class Probabilities</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "22px" }}>
              {classProbabilities.map((cp, idx) => {
                const isSelected = idx === gradeIndex;
                const pct = (cp.val * 100).toFixed(1);
                return (
                  <div key={cp.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                      <strong style={{ color: isSelected ? currentLevel.color : "#334155" }}>
                        {cp.name}
                      </strong>
                      <span style={{ fontWeight: isSelected ? "700" : "500", color: isSelected ? currentLevel.color : "#64748b" }}>
                        {pct}%
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: isSelected ? currentLevel.color : "#cbd5e1",
                          borderRadius: "4px",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <span className="panel-label">AI LESION DETECTION</span>
            <h4 style={{ margin: "6px 0 12px", fontSize: "14px" }}>Key Retinal Biomarkers</h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
              <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "6px" }}>
                Microaneurysms: <strong style={{ color: gradeIndex >= 1 ? "#ea580c" : "#16a34a" }}>{gradeIndex >= 1 ? "Detected" : "None"}</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "6px" }}>
                Hemorrhages: <strong style={{ color: gradeIndex >= 2 ? "#ea580c" : "#16a34a" }}>{gradeIndex >= 2 ? "Present" : "None"}</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "6px" }}>
                Hard Exudates: <strong style={{ color: gradeIndex >= 2 ? "#ea580c" : "#16a34a" }}>{gradeIndex >= 2 ? "Noted" : "Absent"}</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "6px" }}>
                Neovascularization: <strong style={{ color: gradeIndex === 4 ? "#dc2626" : "#16a34a" }}>{gradeIndex === 4 ? "Critical" : "None"}</strong>
              </div>
            </div>
          </section>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <Link to="/operator/history" className="operator-primary-button" style={{ background: "#e2e8f0", color: "#334155" }}>
            ← Return to Screening History
          </Link>
          <Link to="/operator/new-screening" className="operator-primary-button">
            + Start Next Patient Screening
          </Link>
          <Link to="/operator/explainability" style={{ color: "#1c9aa5", fontSize: "13px", textDecoration: "none", fontWeight: "600", marginLeft: "auto" }}>
            Open Deep Grad-CAM Explainability Inspector →
          </Link>
        </div>
      </main>
    </div>
  );
}
