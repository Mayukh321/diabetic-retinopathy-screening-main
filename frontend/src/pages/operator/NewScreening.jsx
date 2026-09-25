import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/operator.css";

export default function NewScreening() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    age: "",
    gender: "male",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a retinal fundus image.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("patient_id", formData.patientId);
      data.append("patient_name", formData.patientName);
      data.append("age", formData.age);
      data.append("gender", formData.gender);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/screenings/upload`,
        { method: "POST", body: data }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Upload failed.");
        setIsSubmitting(false);
        return;
      }

      // Navigate to screening result or operator dashboard
      navigate("/operator", {
        state: { message: `Screening ${result.screening_id} created successfully.` },
      });
    } catch (err) {
      setError("Could not connect to the server. Please try again.");
      setIsSubmitting(false);
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
            <h1>New Screening</h1>
          </div>

          <div className="operator-user">
            <div className="operator-avatar">OP</div>
            <div className="operator-user-info">
              <strong>Screening Operator</strong>
              <small>Healthcare Professional</small>
            </div>
          </div>
        </header>


        {/* SCREENING FORM */}
        <section className="operator-panel" style={{ padding: "30px" }}>

          <div className="panel-header" style={{ borderBottom: "none", paddingBottom: "0" }}>
            <div>
              <span className="panel-label">PATIENT REGISTRATION</span>
              <h2>Start New Retinal Screening</h2>
            </div>
          </div>

          <p style={{ color: "#7c8995", fontSize: "13px", margin: "8px 0 25px", paddingLeft: "25px" }}>
            Register the patient and upload a retinal fundus image for AI-assisted DR screening.
          </p>

          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              padding: "11px 14px",
              borderRadius: "9px",
              fontSize: "13px",
              margin: "0 25px 18px",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ padding: "0 25px 10px" }}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>

              <div className="form-group">
                <label htmlFor="patientId">Patient ID</label>
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
                <label htmlFor="patientName">Patient Name</label>
                <input
                  id="patientName"
                  name="patientName"
                  type="text"
                  placeholder="Full name"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>

              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="0"
                  max="120"
                  placeholder="Patient age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

            </div>


            {/* Image Upload */}
            <div className="form-group" style={{ marginBottom: "22px" }}>
              <label>Retinal Fundus Image</label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed #c0d4da",
                  borderRadius: "12px",
                  padding: preview ? "12px" : "40px 20px",
                  textAlign: "center",
                  background: "#f9fcfd",
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
                        maxHeight: "280px",
                        borderRadius: "8px",
                        objectFit: "contain",
                      }}
                    />
                    <p style={{ marginTop: "8px", fontSize: "12px", color: "#71808e" }}>
                      {file.name} — Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "36px", color: "#1c9aa5", marginBottom: "10px" }}>◉</div>
                    <p style={{ color: "#71808e", fontSize: "14px", fontWeight: "600" }}>
                      Click or drag to upload retinal image
                    </p>
                    <p style={{ color: "#a0aab2", fontSize: "12px", marginTop: "6px" }}>
                      JPEG, PNG, or WEBP — Max 10 MB
                    </p>
                  </div>
                )}
              </div>
            </div>


            {/* Submit */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                type="submit"
                className="operator-primary-button"
                disabled={isSubmitting}
                style={{ padding: "14px 28px", fontSize: "14px" }}
              >
                {isSubmitting ? "Uploading..." : "Submit Screening →"}
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
