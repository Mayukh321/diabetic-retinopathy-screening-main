import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/operator.css";

export default function Settings() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "Alex Rivera",
    email: "alex.rivera@screening.org",
    centerId: "SC-MAIN-001",
    organization: "Central Screening Unit",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    referralAlerts: true,
    dailySummary: false,
  });

  const [saved, setSaved] = useState(false);

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
        </nav>

        <div className="operator-sidebar-bottom">
          <Link to="/operator/settings" className="operator-nav-item active">
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
            <p className="operator-page-label">ACCOUNT</p>
            <h1>Settings</h1>
          </div>
          <div className="operator-user">
            <div className="operator-avatar">OP</div>
            <div className="operator-user-info">
              <strong>Screening Operator</strong>
              <small>Healthcare Professional</small>
            </div>
          </div>
        </header>


        {saved && (
          <div style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            padding: "12px 18px",
            borderRadius: "10px",
            fontSize: "13px",
            marginBottom: "20px",
            fontWeight: "600",
          }}>
            ✓ Settings saved successfully
          </div>
        )}


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
                <label htmlFor="organization">Organization</label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  value={profile.organization}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="centerId">Center ID</label>
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
              <h2 style={{ marginTop: "5px", fontSize: "18px" }}>Alerts & Notifications</h2>
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
                Email alerts for new screening results
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "14px", color: "#334450" }}>
                <input
                  type="checkbox"
                  name="referralAlerts"
                  checked={notifications.referralAlerts}
                  onChange={handleNotifChange}
                  style={{ accentColor: "#1c9aa5", width: "18px", height: "18px" }}
                />
                Alert when a case is marked referable
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "14px", color: "#334450" }}>
                <input
                  type="checkbox"
                  name="dailySummary"
                  checked={notifications.dailySummary}
                  onChange={handleNotifChange}
                  style={{ accentColor: "#1c9aa5", width: "18px", height: "18px" }}
                />
                Daily screening summary email
              </label>
            </div>
          </section>


          {/* ACTIONS */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              type="submit"
              className="operator-primary-button"
              style={{ padding: "13px 28px", fontSize: "14px" }}
            >
              Save Settings
            </button>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: "13px 28px",
                border: "1px solid #e28c8c",
                borderRadius: "8px",
                background: "#fff5f5",
                color: "#b91c1c",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}
