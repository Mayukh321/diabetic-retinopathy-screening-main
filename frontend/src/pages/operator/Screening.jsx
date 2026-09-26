import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/operator.css";

export default function Screening() {
  const navigate = useNavigate();
  const [activeEye, setActiveEye] = useState("OD"); // OD = Right, OS = Left
  const [qualityScore, setQualityScore] = useState({
    focus: 94,
    illumination: 91,
    fieldOfView: 96,
    artifactLevel: 4,
    overall: "Diagnostic Grade (Pass)",
  });
  const [cameraActive, setCameraActive] = useState(false);

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
          <Link to="/operator/screening" className="operator-nav-item active">
            <span>👁️</span> Image Acquisition
          </Link>
          <Link to="/operator/history" className="operator-nav-item">
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
            <p className="operator-page-label">LIVE FUNDUS ACQUISITION</p>
            <h1>Retinal Imaging & Quality Assessment</h1>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/operator/new-screening" className="operator-primary-button">
              + Full Screening Form
            </Link>
          </div>
        </header>

        {/* EYE SELECTION & STATUS */}
        <section
          style={{
            background: "white",
            padding: "16px 24px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Target Eye:</span>
            <button
              type="button"
              onClick={() => setActiveEye("OD")}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: activeEye === "OD" ? "2px solid #1c9aa5" : "1px solid #cbd5e1",
                background: activeEye === "OD" ? "#f0fdfa" : "#ffffff",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              OD (Right Eye)
            </button>
            <button
              type="button"
              onClick={() => setActiveEye("OS")}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: activeEye === "OS" ? "2px solid #1c9aa5" : "1px solid #cbd5e1",
                background: activeEye === "OS" ? "#f0fdfa" : "#ffffff",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              OS (Left Eye)
            </button>
          </div>

          <div style={{ fontSize: "13px", color: "#16a34a", fontWeight: "700" }}>
            ✓ Real-time Automated Quality Control: Enabled
          </div>
        </section>

        {/* VIEWER & QUALITY METRICS */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "22px" }}>
          {/* CAMERA / FUNDUS SIMULATOR */}
          <section className="operator-panel" style={{ padding: "24px", margin: 0 }}>
            <span className="panel-label">CAMERA FEED / VIEWFINDER</span>
            <h3 style={{ margin: "4px 0 14px" }}>45° Optical Alignment Target</h3>

            <div
              style={{
                position: "relative",
                width: "100%",
                height: "360px",
                background: "#080e1a",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Synthetic Fundus Circle */}
              <div
                style={{
                  width: "320px",
                  height: "320px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 55% 50%, #d85b1a 20%, #a83506 60%, #360e02 100%)",
                  boxShadow: "0 0 30px rgba(216, 91, 26, 0.4)",
                  position: "relative",
                }}
              >
                {/* Reticle Guide Lines */}
                <div
                  style={{
                    position: "absolute",
                    inset: "20px",
                    border: "1px dashed rgba(255,255,255,0.4)",
                    borderRadius: "50%",
                  }}
                />
                {/* Target Crosshair */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "24px",
                    height: "24px",
                    border: "2px solid #22c55e",
                    borderRadius: "50%",
                  }}
                />
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "14px",
                  background: "rgba(0,0,0,0.65)",
                  color: "#4ade80",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "600",
                }}
              >
                ● 1080p Tele-Ophthalmoscope Feed
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: "14px",
                  right: "14px",
                  background: "rgba(0,0,0,0.75)",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              >
                Eye: {activeEye === "OD" ? "Right (OD)" : "Left (OS)"}
              </div>
            </div>

            <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="operator-primary-button"
                onClick={() => navigate("/operator/new-screening")}
              >
                📸 Capture & Send to AI Analysis
              </button>
              <button
                type="button"
                onClick={() => setCameraActive(!cameraActive)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "white",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                {cameraActive ? "Pause Feed" : "Calibrate Camera"}
              </button>
            </div>
          </section>

          {/* QUALITY METRICS */}
          <section className="operator-panel" style={{ padding: "24px", margin: 0 }}>
            <span className="panel-label">IMAGE QUALITY INDEX</span>
            <h3 style={{ margin: "4px 0 16px" }}>Diagnostic Usability Score</h3>

            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "14px 18px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              <span style={{ fontSize: "11px", color: "#166534", fontWeight: "700", textTransform: "uppercase" }}>
                Overall Quality Status
              </span>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#16a34a", margin: "2px 0" }}>
                ✓ {qualityScore.overall}
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#15803d" }}>
                Fundus photograph meets AAO tele-screening technical standards.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                  <span>Sharpness & Focus Clarity</span>
                  <strong>{qualityScore.focus}% (Good)</strong>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "4px" }}>
                  <div style={{ width: `${qualityScore.focus}%`, height: "100%", background: "#16a34a", borderRadius: "4px" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                  <span>Uniform Illumination & Contrast</span>
                  <strong>{qualityScore.illumination}% (Optimal)</strong>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "4px" }}>
                  <div style={{ width: `${qualityScore.illumination}%`, height: "100%", background: "#16a34a", borderRadius: "4px" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                  <span>Field of View (45° Macular Centering)</span>
                  <strong>{qualityScore.fieldOfView}% (Accurate)</strong>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "4px" }}>
                  <div style={{ width: `${qualityScore.fieldOfView}%`, height: "100%", background: "#16a34a", borderRadius: "4px" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                  <span>Artifact & Glare Interference</span>
                  <strong style={{ color: "#16a34a" }}>{qualityScore.artifactLevel}% (Minimal)</strong>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "4px" }}>
                  <div style={{ width: `${qualityScore.artifactLevel}%`, height: "100%", background: "#16a34a", borderRadius: "4px" }} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
