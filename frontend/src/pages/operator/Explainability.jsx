import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/operator.css";

const EXPLAINABILITY_CASES = [
  {
    id: "CASE-01",
    patient: "Eleanor Vance (P-1024)",
    title: "Moderate Non-Proliferative DR (Grade 2)",
    confidence: "93.4%",
    primaryZones: "Superior-temporal arcades & macular border",
    keyLesions: ["Microaneurysms", "Blot Hemorrhages", "Hard Exudates"],
    gradCamCenter: { x: 45, y: 55 },
    intensity: "High (0.88 max activation)",
    clinicalRationale:
      "The neural network attention heavily weights clusters of punctate microaneurysms and flame hemorrhages near the superior arcade, triggering the Grade 2 classification threshold.",
  },
  {
    id: "CASE-02",
    patient: "Marcus Brody (P-1031)",
    title: "Severe Non-Proliferative DR (Grade 3)",
    confidence: "96.8%",
    primaryZones: "4-Quadrant intraretinal microvascular abnormalities (IRMA)",
    keyLesions: ["Venous Beading", "Cotton Wool Spots", "Extensive Hemorrhages"],
    gradCamCenter: { x: 55, y: 40 },
    intensity: "Critical (0.95 max activation)",
    clinicalRationale:
      "Widespread convolutional feature activations across multiple quadrants correspond to the clinical 4:2:1 criteria for severe NPDR.",
  },
  {
    id: "CASE-03",
    patient: "Arthur Pendelton (P-1008)",
    title: "No Apparent Diabetic Retinopathy (Grade 0)",
    confidence: "99.1%",
    primaryZones: "Normal uniform background illumination",
    keyLesions: ["No pathological lesions detected"],
    gradCamCenter: { x: 50, y: 50 },
    intensity: "Low baseline (0.12)",
    clinicalRationale:
      "Diffused low-intensity attention without focused hotspots. Model verifies unobstructed clear fundus and intact vessel morphology.",
  },
];

export default function Explainability() {
  const [selectedCase, setSelectedCase] = useState(EXPLAINABILITY_CASES[0]);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.7);
  const [showLesionBboxes, setShowLesionBboxes] = useState(true);
  const [activeLayer, setActiveLayer] = useState("layer4");

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
          <Link to="/operator/reports" className="operator-nav-item">
            <span>▧</span> Reports
          </Link>
          <Link to="/operator/explainability" className="operator-nav-item active">
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
            <p className="operator-page-label">EXPLAINABLE AI (XAI) SUITE</p>
            <h1>Grad-CAM Attention & Feature Attribution</h1>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/doctor/reviews" className="operator-primary-button" style={{ background: "#e0f4f4", color: "#087f8c" }}>
              Switch to Doctor Clinical Queue →
            </Link>
          </div>
        </header>

        {/* CASE SELECTION TABS */}
        <section
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {EXPLAINABILITY_CASES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCase(c)}
              style={{
                padding: "12px 18px",
                borderRadius: "10px",
                border: selectedCase.id === c.id ? "2px solid #1c9aa5" : "1px solid #cbd5e1",
                background: selectedCase.id === c.id ? "#f0fdfa" : "#ffffff",
                textAlign: "left",
                cursor: "pointer",
                transition: "0.2s ease",
                minWidth: "220px",
              }}
            >
              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>{c.id}</div>
              <strong style={{ display: "block", fontSize: "13px", color: "#1e293b", margin: "2px 0" }}>
                {c.patient.split(" ")[0]}
              </strong>
              <small style={{ color: "#087f8c", fontWeight: "600" }}>{c.title.split("(")[0]}</small>
            </button>
          ))}
        </section>

        {/* MAIN VISUALIZATION ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "24px", marginBottom: "26px" }}>
          {/* INTERACTIVE FUNDUS + GRAD-CAM CANVAS */}
          <section className="operator-panel" style={{ padding: "24px", margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <span className="panel-label">HEATMAP OVERLAY</span>
                <h3 style={{ margin: "4px 0 0" }}>Target Feature Activation Map</h3>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                {["layer4", "layer3"].map((layer) => (
                  <button
                    key={layer}
                    type="button"
                    onClick={() => setActiveLayer(layer)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: activeLayer === layer ? "#1c9aa5" : "#f1f5f9",
                      color: activeLayer === layer ? "#ffffff" : "#475569",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {layer.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Fundus Container */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "360px",
                background: "#0c1524",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Synthetic Fundus Backing */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "radial-gradient(circle at 62% 48%, #c44d14 25%, #8c2805 60%, #1e0701 100%)",
                  position: "relative",
                }}
              >
                {/* Optic Disc */}
                <div
                  style={{
                    position: "absolute",
                    right: "22%",
                    top: "38%",
                    width: "56px",
                    height: "56px",
                    background: "#ffd88a",
                    borderRadius: "50%",
                    boxShadow: "0 0 16px rgba(255,216,138,0.7)",
                  }}
                />
                {/* Macular Center */}
                <div
                  style={{
                    position: "absolute",
                    left: "38%",
                    top: "45%",
                    width: "36px",
                    height: "36px",
                    background: "#5e1502",
                    borderRadius: "50%",
                  }}
                />
              </div>

              {/* Dynamic Grad-CAM Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: heatmapOpacity,
                  pointerEvents: "none",
                  background: `radial-gradient(circle at ${selectedCase.gradCamCenter.x}% ${selectedCase.gradCamCenter.y}%, rgba(255,0,0,0.85) 0%, rgba(255,140,0,0.65) 30%, rgba(255,230,0,0.45) 50%, rgba(0,100,255,0.2) 75%, transparent 90%)`,
                  mixBlendMode: "screen",
                  transition: "all 0.3s ease",
                }}
              />

              {/* Lesion Bounding Markers */}
              {showLesionBboxes && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      left: `${selectedCase.gradCamCenter.x - 12}%`,
                      top: `${selectedCase.gradCamCenter.y - 10}%`,
                      width: "80px",
                      height: "50px",
                      border: "2px dashed #facc15",
                      borderRadius: "6px",
                      pointerEvents: "none",
                      boxShadow: "0 0 8px rgba(250,204,21,0.5)",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "-18px",
                        left: 0,
                        background: "#facc15",
                        color: "#000",
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "1px 5px",
                        borderRadius: "3px",
                      }}
                    >
                      Lesion Cluster
                    </span>
                  </div>
                </>
              )}

              {/* Status pill */}
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "14px",
                  background: "rgba(0,0,0,0.75)",
                  color: "#ffffff",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                }}
              >
                Heatmap Peak: {selectedCase.intensity}
              </div>
            </div>

            {/* Controls */}
            <div style={{ marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#475569" }}>
                <span>Grad-CAM Opacity:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={heatmapOpacity}
                  onChange={(e) => setHeatmapOpacity(Number.parseFloat(e.target.value))}
                  style={{ width: "130px", accentColor: "#1c9aa5" }}
                />
                <strong>{Math.round(heatmapOpacity * 100)}%</strong>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", color: "#334155" }}>
                <input
                  type="checkbox"
                  checked={showLesionBboxes}
                  onChange={(e) => setShowLesionBboxes(e.target.checked)}
                  style={{ accentColor: "#1c9aa5" }}
                />
                Show Biomarker Callouts
              </label>
            </div>
          </section>

          {/* CLINICAL INTERPRETATION PANEL */}
          <section className="operator-panel" style={{ padding: "24px", margin: 0 }}>
            <span className="panel-label">INTERPRETABILITY RATIONALE</span>
            <h3 style={{ margin: "4px 0 14px" }}>Why Did AI Predict This Grade?</h3>

            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
                Patient Diagnosis
              </span>
              <h4 style={{ margin: "3px 0 0", color: "#0f172a", fontSize: "16px" }}>
                {selectedCase.title}
              </h4>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#087f8c", fontWeight: "600" }}>
                Model Confidence: {selectedCase.confidence}
              </p>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <strong style={{ fontSize: "13px", color: "#334155", display: "block", marginBottom: "6px" }}>
                Clinical Reasoning:
              </strong>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5", margin: 0 }}>
                {selectedCase.clinicalRationale}
              </p>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <strong style={{ fontSize: "13px", color: "#334155", display: "block", marginBottom: "8px" }}>
                Flagged Pathological Biomarkers:
              </strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {selectedCase.keyLesions.map((l) => (
                  <span
                    key={l}
                    style={{
                      background: "#fff1f2",
                      border: "1px solid #fecdd3",
                      color: "#be123c",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    • {l}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <strong style={{ fontSize: "13px", color: "#334155", display: "block", marginBottom: "4px" }}>
                High-Attention Anatomical Zones:
              </strong>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                {selectedCase.primaryZones}
              </p>
            </div>
          </section>
        </div>

        {/* BOTTOM XAI METHODOLOGY CARD */}
        <section
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "20px 24px",
            fontSize: "13px",
            color: "#475569",
          }}
        >
          <strong style={{ color: "#0f172a", fontSize: "14px", display: "block", marginBottom: "6px" }}>
            How RetinaGuard XAI Works
          </strong>
          Grad-CAM computes the gradient of the predicted DR class score with respect to the feature activation map
          of the final convolutional layer. This creates a visual heat map identifying exactly which retinal blood
          vessels, hard exudates, or microaneurysms led the neural network to recommend a specialist referral.
        </section>
      </main>
    </div>
  );
}
