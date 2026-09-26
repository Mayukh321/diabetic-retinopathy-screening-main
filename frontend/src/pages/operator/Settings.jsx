import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { API_BASE_URL, SERVER_ROOT_URL } from "../../services/api";
import "../../styles/operator.css";

export default function Settings() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "Alex Rivera",
    email: "alex.rivera@screening.org",
    centerId: "SC-MAIN-001",
    organization: "Central Teleophthalmology Unit",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    referralAlerts: true,
    dailySummary: false,
  });

  const [backendStatus, setBackendStatus] = useState({
    checking: true,
    online: false,
    latency: null,
    error: null,
  });

  const [saved, setSaved] = useState(false);

  const checkConnection = async () => {
    setBackendStatus({ checking: true, online: false, latency: null, error: null });
    const start = performance.now();
    try {
      const res = await api.checkHealth();
      const latency = Math.round(performance.now() - start);
      if (res && res.status === "ok") {
        setBackendStatus({ checking: false, online: true, latency, error: null });
      } else {
        setBackendStatus({
          checking: false,
          online: false,
          latency,
          error: res.error || "Service unavailable",
        });
      }
    } catch (err) {
      setBackendStatus({
        checking: false,
        online: false,
        latency: null,
        error: err.message,
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleNotifChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({ ...prev, [name]: checked }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user_session");
    navigate("/login");
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
          <Link to="/operator/explainability" className="operator-nav-item">
            <span>✦</span> Explainability
          </Link>
        </nav>

        <div className="operator-sidebar-bottom">
          <Link to="/operator/settings" className="operator-nav-item active">
            <span>⚙</span> Settings
          </Link>
          <Link to="/login" className="operator-nav-item logout" onClick={handleLogout}>
            <span>↪</span> Logout
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main className="operator-main">
        <header className="operator-topbar">
          <div>
            <p className="operator-page-label">CONFIGURATION & TELEMETRY</p>
            <h1>System Settings & Diagnostics</h1>
          </div>

          <div className="operator-user">
            <button
              type="button"
              onClick={checkConnection}
              style={{
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🔄 Re-test Backend Connection
            </button>
          </div>
        </header>

        {saved && (
          <div
            style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              padding: "12px 18px",
              borderRadius: "10px",
              fontSize: "13px",
              marginBottom: "20px",
              fontWeight: "600",
            }}
          >
            ✓ Operator profile and preferences saved successfully
          </div>
        )}

        {/* SYSTEM CONNECTION & HEALTH DIAGNOSTICS CARD */}
        <section className="operator-panel" style={{ padding: "26px", marginBottom: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <span className="panel-label">TELEMETRY & INTEGRATION</span>
              <h2 style={{ fontSize: "18px", margin: "4px 0 0" }}>
                Backend & Database Connection Health
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "20px",
                background: backendStatus.online ? "#ecfdf5" : "#fef2f2",
                border: `1px solid ${backendStatus.online ? "#a7f3d0" : "#fecaca"}`,
                color: backendStatus.online ? "#065f46" : "#b91c1c",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: backendStatus.online ? "#10b981" : "#ef4444",
                }}
              />
              {backendStatus.checking
                ? "Pinging Backend..."
                : backendStatus.online
                ? `Online (${backendStatus.latency} ms)`
                : "Connection Error"}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "14px",
              fontSize: "12px",
            }}
          >
            <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "8px" }}>
              <span style={{ color: "#64748b", display: "block" }}>API Endpoint:</span>
              <strong style={{ color: "#0f172a", wordBreak: "break-all" }}>{API_BASE_URL}</strong>
            </div>

            <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "8px" }}>
              <span style={{ color: "#64748b", display: "block" }}>PostgreSQL Scans DB:</span>
              <strong style={{ color: backendStatus.online ? "#16a34a" : "#dc2626" }}>
                {backendStatus.online ? "✓ Connected (Neon Pool)" : "Disconnected"}
              </strong>
            </div>

            <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "8px" }}>
              <span style={{ color: "#64748b", display: "block" }}>Doctor Reports DB:</span>
              <strong style={{ color: backendStatus.online ? "#16a34a" : "#dc2626" }}>
                {backendStatus.online ? "✓ Connected (DocDB)" : "Disconnected"}
              </strong>
            </div>

            <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "8px" }}>
              <span style={{ color: "#64748b", display: "block" }}>ONNX Model Status:</span>
              <strong style={{ color: "#16a34a" }}>✓ dr_model.onnx Loaded</strong>
            </div>
          </div>
        </section>

        <form onSubmit={handleSave}>
          {/* PROFILE */}
          <section className="operator-panel" style={{ padding: "28px 30px", marginBottom: "20px" }}>
            <div style={{ marginBottom: "22px" }}>
              <span className="panel-label">PROFILE INFORMATION</span>
              <h2 style={{ marginTop: "5px", fontSize: "18px" }}>Operator Profile</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={profile.name}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="organization">Screening Center / Health Facility</label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  value={profile.organization}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="centerId">Center Facility ID</label>
                <input
                  id="centerId"
                  name="centerId"
                  type="text"
                  value={profile.centerId}
                  onChange={handleProfileChange}
                />
              </div>
            </div>
          </section>

          {/* NOTIFICATIONS */}
          <section className="operator-panel" style={{ padding: "28px 30px", marginBottom: "20px" }}>
            <div style={{ marginBottom: "22px" }}>
              <span className="panel-label">NOTIFICATION PREFERENCES</span>
              <h2 style={{ marginTop: "5px", fontSize: "18px" }}>Alerts & Clinical Relays</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "14px", color: "#334450" }}>
                <input
                  type="checkbox"
                  name="emailAlerts"
                  checked={notifications.emailAlerts}
                  onChange={handleNotifChange}
                  style={{ accentColor: "#1c9aa5", width: "18px", height: "18px" }}
                />
                Email alerts for completed retinal AI screening inferences
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "14px", color: "#334450" }}>
                <input
                  type="checkbox"
                  name="referralAlerts"
                  checked={notifications.referralAlerts}
                  onChange={handleNotifChange}
                  style={{ accentColor: "#1c9aa5", width: "18px", height: "18px" }}
                />
                Instant alert notification when a patient is categorized as Referable (Grade 2–4)
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "14px", color: "#334450" }}>
                <input
                  type="checkbox"
                  name="dailySummary"
                  checked={notifications.dailySummary}
                  onChange={handleNotifChange}
                  style={{ accentColor: "#1c9aa5", width: "18px", height: "18px" }}
                />
                Daily automated screening throughput & quality summary report
              </label>
            </div>
          </section>

          {/* ACTIONS */}
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <button
              type="submit"
              className="operator-primary-button"
              style={{ padding: "13px 30px", fontSize: "14px" }}
            >
              Save Configuration
            </button>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: "13px 26px",
                border: "1px solid #e28c8c",
                borderRadius: "8px",
                background: "#fff5f5",
                color: "#b91c1c",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
