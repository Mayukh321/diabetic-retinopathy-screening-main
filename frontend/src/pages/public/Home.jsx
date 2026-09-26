import { Link } from "react-router-dom";
import heroBackground from "../../assets/images/hero-background.png";
import { useEffect, useRef } from "react";

export default function Home() {
  const featuresRef = useRef(null);
  const workflowRef = useRef(null);
  const ctaRef = useRef(null);
  const contactRef = useRef(null);

  // FEATURES ANIMATION
  useEffect(() => {
    const section = featuresRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add("features-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // WORKFLOW ANIMATION
  useEffect(() => {
    const section = workflowRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add("workflow-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // CTA ANIMATION
  useEffect(() => {
    const section = ctaRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add("cta-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">◉</span>
          <span>DR-Screen AI</span>
        </div>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#contact">Contact</a>
        </nav>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link to="/login/operator" style={{ color: "#334155", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
            Operator Portal
          </Link>
          <Link to="/login" className="login-button">
            Professional Login
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main>
        {/* HERO */}
        <section
          className="hero"
          id="home"
          style={{
            backgroundImage: `url(${heroBackground})`,
          }}
        >
          <div className="hero-content">
            <div className="hero-badge">AI-Powered Retinal Screening</div>

            <h1>
              Explainable AI for
              <span> Diabetic Retinopathy </span>
              Screening
            </h1>

            <p>
              An intelligent tele-ophthalmology screening platform that analyzes retinal fundus
              photographs, grades diabetic retinopathy across 5 ICDR severity levels, and delivers
              clinically actionable Grad-CAM explainability.
            </p>

            <div className="hero-buttons">
              <Link to="/login/operator" className="primary-button">
                Operator Screening Suite →
              </Link>

              <Link to="/login/ophthalmologist" className="secondary-button" style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", borderColor: "rgba(255,255,255,0.3)" }}>
                Doctor Clinical Triage →
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features" id="about" ref={featuresRef}>
          <div className="section-heading features-heading">
            <span>CORE FEATURES</span>
            <h2>Intelligent Retinal Screening</h2>
            <p>Designed to support early detection, triage, and remote ophthalmologist clinical review.</p>
          </div>

          <div className="feature-grid">
            <div className="feature-card feature-card-1">
              <div className="feature-icon">◎</div>
              <h3>Automated Quality Check</h3>
              <p>
                Real-time assessment of retinal fundus illumination, focus sharpness, and 45° macular
                centering prior to inference.
              </p>
            </div>

            <div className="feature-card feature-card-2">
              <div className="feature-icon">◈</div>
              <h3>DR Severity Classification</h3>
              <p>
                Standardized ICDR grading from Grade 0 (No DR) to Grade 4 (Proliferative DR) with
                calibrated confidence scoring.
              </p>
            </div>

            <div className="feature-card feature-card-3">
              <div className="feature-icon">✦</div>
              <h3>Explainable AI (Grad-CAM)</h3>
              <p>
                Gradient-weighted feature attribution heatmaps reveal key biomarkers: microaneurysms,
                hemorrhages, and neovascularization.
              </p>
            </div>

            <div className="feature-card feature-card-4">
              <div className="feature-icon">◉</div>
              <h3>Ophthalmologist Sign-Off</h3>
              <p>
                Remote vitreo-retinal specialists validate referred cases, sign digital clinical
                assessments, and issue patient care plans.
              </p>
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="how-it-works" id="how-it-works" ref={workflowRef}>
          <div className="section-heading workflow-heading">
            <span>WORKFLOW</span>
            <h2>How the Screening Pipeline Works</h2>
          </div>

          <div className="workflow">
            <div className="workflow-step workflow-step-1">
              <div className="step-number">01</div>
              <h3>Capture</h3>
              <p>Technician captures or uploads digital 45° fundus photography.</p>
            </div>

            <div className="workflow-line workflow-line-1"></div>

            <div className="workflow-step workflow-step-2">
              <div className="step-number">02</div>
              <h3>Quality Check</h3>
              <p>Automated verification ensures focus, lighting, and foveal alignment.</p>
            </div>

            <div className="workflow-line workflow-line-2"></div>

            <div className="workflow-step workflow-step-3">
              <div className="step-number">03</div>
              <h3>AI Screening</h3>
              <p>Deep neural network classifies DR severity & referable status.</p>
            </div>

            <div className="workflow-line workflow-line-3"></div>

            <div className="workflow-step workflow-step-4">
              <div className="step-number">04</div>
              <h3>Explain & Certify</h3>
              <p>Grad-CAM heatmaps guide specialist validation and clinical sign-off.</p>
            </div>
          </div>
        </section>

        {/* CONTACT & CLINICAL INTEGRATION SECTION */}
        <section
          id="contact"
          ref={contactRef}
          style={{
            padding: "80px 24px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div className="section-heading" style={{ marginBottom: "40px" }}>
              <span>HEALTHCARE PROVIDER NETWORK</span>
              <h2>Clinical Collaboration & Contact</h2>
              <p>Connecting community screening centers with regional vitreo-retinal institutes.</p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "24px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "28px", color: "#1c9aa5", marginBottom: "8px" }}>🏥</div>
                <strong style={{ fontSize: "16px", display: "block", marginBottom: "4px" }}>
                  Screening Centers
                </strong>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 12px" }}>
                  Register your clinic or primary care facility to start teleophthalmology screenings.
                </p>
                <Link to="/register" style={{ fontSize: "13px", color: "#1c9aa5", fontWeight: "700", textDecoration: "none" }}>
                  Register Center →
                </Link>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "24px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "28px", color: "#087f8c", marginBottom: "8px" }}>👁️</div>
                <strong style={{ fontSize: "16px", display: "block", marginBottom: "4px" }}>
                  Ophthalmologists
                </strong>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 12px" }}>
                  Join our verified telemedicine network to review and certify referred DR cases.
                </p>
                <Link to="/register/doctor" style={{ fontSize: "13px", color: "#087f8c", fontWeight: "700", textDecoration: "none" }}>
                  Join Specialist Network →
                </Link>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "24px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "28px", color: "#e11d48", marginBottom: "8px" }}>🩺</div>
                <strong style={{ fontSize: "16px", display: "block", marginBottom: "4px" }}>
                  Clinical Support
                </strong>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 8px" }}>
                  Email: support@retinaguard.health
                </p>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                  Clinical Telemed Hotline: +1 (800) 555-EYES
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta" id="cta-section" ref={ctaRef}>
          <div className="cta-content">
            <h2>Ready to initiate retinal screening?</h2>
            <p>Access the operator screening suite or ophthalmologist review queue to begin.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Link to="/login" className="primary-button cta-button">
              Sign In to Portal →
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-icon">◉</span>
              <span>DR-Screen AI</span>
            </div>
            <p>Explainable AI for Diabetic Retinopathy Screening</p>
          </div>

          <div className="footer-purpose">
            <span className="footer-label">CLINICAL TRIAGE PLATFORM</span>
            <p>
              AI-assisted retinal screening with human-in-the-loop ophthalmologist certification.
            </p>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <span>© 2026 DR-Screen AI · RetinaGuard Clinical Systems. All rights reserved.</span>
          <span className="footer-status">
            <span className="footer-status-dot"></span>
            AI-assisted screening active
          </span>
        </div>
      </footer>
    </div>
  );
}