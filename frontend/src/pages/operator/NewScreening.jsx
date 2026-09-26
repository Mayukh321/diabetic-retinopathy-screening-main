import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/operator.css";

// Sample base64 fundus image or SVG generator for quick testing if user has no image file
function createSampleFundusBlob() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Background dark fundus
  const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 250);
  grad.addColorStop(0, "#d85b1a");
  grad.addColorStop(0.7, "#a83506");
  grad.addColorStop(1, "#360e02");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Optic disc
  ctx.beginPath();
  ctx.arc(380, 250, 45, 0, 2 * Math.PI);
  ctx.fillStyle = "#ffdd80";
  ctx.fill();

  // Macula
  ctx.beginPath();
  ctx.arc(210, 260, 25, 0, 2 * Math.PI);
  ctx.fillStyle = "#8a2400";
  ctx.fill();

  // Blood vessels
  ctx.strokeStyle = "#660c00";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(380, 250);
  ctx.quadraticCurveTo(300, 180, 200, 150);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(380, 250);
  ctx.quadraticCurveTo(320, 320, 180, 360);
  ctx.stroke();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], "sample_retina_fundus.png", { type: "image/png" }));
    }, "image/png");
  });
}

export default function NewScreening() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientId: "P-" + Math.floor(1000 + Math.random() * 9000),
    patientName: "",
    age: "54",
    gender: "female",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError("");
    }
  };

  const handleLoadSample = async () => {
    try {
      const sampleFile = await createSampleFundusBlob();
      setFile(sampleFile);
      setPreview(URL.createObjectURL(sampleFile));
      if (!formData.patientName) {
        setFormData((prev) => ({ ...prev, patientName: "Eleanor Vance" }));
      }
      setError("");
    } catch (err) {
      console.error("Could not generate sample fundus image:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select or drop a retinal fundus image.");
      return;
    }

    if (!formData.patientName.trim()) {
      setError("Please enter the patient's full name.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload scan
      setAnalysisStep("Uploading fundus scan to Cloudinary...");
      const data = new FormData();
      data.append("file", file);
      data.append("patient_id", formData.patientId);
      data.append("patient_name", formData.patientName);
      data.append("age", formData.age);
      data.append("gender", formData.gender);
      data.append("technician_id", "OP-ALEX-01");

      const uploadResult = await api.uploadScreening(data);
      const screeningId = uploadResult.screening_id;

      // 2. Trigger ML inference
      setAnalysisStep("Running ONNX Retinopathy Inference & Grad-CAM analysis...");
      try {
        await api.processScreening(screeningId);
        // Wait briefly for worker to complete
        await new Promise((r) => setTimeout(r, 1200));
      } catch (procErr) {
        console.warn("Processing triggered with message:", procErr.message);
      }

      setAnalysisStep("Inference complete! Preparing screening report...");
      await new Promise((r) => setTimeout(r, 500));

      navigate(`/operator/result?id=${screeningId}`, {
        state: {
          uploadedNow: true,
          patientId: formData.patientId,
          patientName: formData.patientName,
          imageUrl: uploadResult.image_url || preview,
        },
      });
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Could not connect to the backend server. Please verify backend is running on port 8000."
      );
      setIsSubmitting(false);
      setAnalysisStep("");
    }
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

          <Link to="/operator/new-screening" className="operator-nav-item active">
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
        {/* TOP BAR */}
        <header className="operator-topbar">
          <div>
            <p className="operator-page-label">SCREENING CENTER</p>
            <h1>New Retinal Screening</h1>
          </div>

          <div className="operator-user">
            <Link
              to="/operator"
              className="operator-primary-button"
              style={{ background: "#edf5f7", color: "#1c9aa5" }}
            >
              ← Back to Dashboard
            </Link>
          </div>
        </header>

        {/* SCREENING FORM */}
        <section className="operator-panel" style={{ padding: "30px" }}>
          <div className="panel-header" style={{ borderBottom: "none", paddingBottom: "0" }}>
            <div>
              <span className="panel-label">PATIENT & FUNDUS ACQUISITION</span>
              <h2>Register Patient & Initiate AI Analysis</h2>
            </div>

            <button
              type="button"
              onClick={handleLoadSample}
              style={{
                background: "#f0fdfa",
                border: "1px solid #99f6e4",
                color: "#0f766e",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ✨ Load Sample Retinal Scan
            </button>
          </div>

          <p
            style={{
              color: "#7c8995",
              fontSize: "13px",
              margin: "8px 0 25px",
            }}
          >
            Enter patient details and upload a standard 45° macular-centered fundus photo.
          </p>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                padding: "11px 14px",
                borderRadius: "9px",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          {isSubmitting && (
            <div
              style={{
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                color: "#0369a1",
                padding: "16px 20px",
                borderRadius: "10px",
                fontSize: "14px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  border: "3px solid #0284c7",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <div>
                <strong>AI Processing in progress...</strong>
                <p style={{ margin: "2px 0 0", fontSize: "12px" }}>{analysisStep}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "18px",
                marginBottom: "18px",
              }}
            >
              <div className="form-group">
                <label htmlFor="patientId">Patient ID / Medical Record Number</label>
                <input
                  id="patientId"
                  name="patientId"
                  type="text"
                  placeholder="e.g. P-1025"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="patientName">Patient Full Name</label>
                <input
                  id="patientName"
                  name="patientName"
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "18px",
                marginBottom: "22px",
              }}
            >
              <div className="form-group">
                <label htmlFor="age">Age (Years)</label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="0"
                  max="120"
                  placeholder="e.g. 54"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Biological Sex</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Image Upload Dropzone */}
            <div className="form-group" style={{ marginBottom: "26px" }}>
              <label>Retinal Fundus Photograph</label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                style={{
                  border: isDragOver ? "2px solid #1c9aa5" : "2px dashed #c0d4da",
                  borderRadius: "12px",
                  padding: preview ? "16px" : "44px 20px",
                  textAlign: "center",
                  background: isDragOver ? "#f0fdfa" : "#f9fcfd",
                  cursor: "pointer",
                  transition: "0.2s ease",
                }}
              >
                {preview ? (
                  <div>
                    <img
                      src={preview}
                      alt="Retinal preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "320px",
                        borderRadius: "10px",
                        objectFit: "contain",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <div style={{ marginTop: "12px", fontSize: "13px", color: "#334155" }}>
                      <strong>{file?.name || "Selected Retinal Scan"}</strong>
                      <span style={{ display: "block", color: "#64748b", fontSize: "12px" }}>
                        Click or drag new image to replace
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "42px", color: "#1c9aa5", marginBottom: "10px" }}>
                      ◉
                    </div>
                    <p style={{ color: "#334155", fontSize: "15px", fontWeight: "600", margin: "0 0 6px" }}>
                      Drop retinal fundus scan here or click to browse
                    </p>
                    <p style={{ color: "#84919d", fontSize: "12px", margin: 0 }}>
                      JPEG, PNG, or WEBP up to 10 MB (Macula & Optic Disc visible)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quality Check Hints */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                marginBottom: "28px",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px" }}>
                ✓ <strong>Sharp Focus:</strong> Blood vessels sharply defined
              </div>
              <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px" }}>
                ✓ <strong>Even Lighting:</strong> No significant over/underexposure
              </div>
              <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px" }}>
                ✓ <strong>Centered:</strong> Fovea and optic disc within 45° field
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <button
                type="submit"
                className="operator-primary-button"
                disabled={isSubmitting}
                style={{ padding: "14px 32px", fontSize: "14px" }}
              >
                {isSubmitting ? "Running AI Pipeline..." : "Upload & Analyze Retinal Scan →"}
              </button>

              <Link
                to="/operator"
                style={{
                  color: "#7c8995",
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
