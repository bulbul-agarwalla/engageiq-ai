import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Eye,
  Activity,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Video,
  Award,
  Layers,
  CheckCircle2,
  Lock,
  Cpu,
  BarChart3,
  Users,
  Compass,
} from 'lucide-react';

export default function LandingPage() {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState('teacher');

  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Top Navigation */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(8, 12, 21, 0.85)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '16px 32px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="sidebar-logo-icon">
              <Brain size={20} color="#FFFFFF" />
            </div>
            <div style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>
              EngageIQ <span className="sidebar-badge">AI</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a
              href="#capabilities"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}
            >
              Capabilities
            </a>
            <a
              href="#telemetry"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}
            >
              Vision Pipeline
            </a>
            <a
              href="#interventions"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}
            >
              AI Pedagogical Engine
            </a>
            <a
              href="#privacy"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}
            >
              Privacy
            </a>
            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
              Launch Platform <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '80px 24px 60px 24px', textAlign: 'center', position: 'relative' }}>
        <div
          style={{
            maxWidth: '920px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '9999px',
              padding: '6px 16px',
              fontSize: '13px',
              color: '#A5B4FC',
              fontWeight: 600,
              marginBottom: '24px',
            }}
          >
            <Sparkles size={16} /> Real-Time Multimodal Telemetry & AI Pedagogical Interventions
          </div>

          <h1
            style={{
              fontSize: 'clamp(36px, 5.5vw, 62px)',
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              marginBottom: '24px',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Intelligent Classroom Engagement & Learning Analytics
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '740px',
              margin: '0 auto 36px auto',
            }}
          >
            EngageIQ AI quantifies student attention live using 478 MediaPipe facial landmarks, iris gaze
            tracking, and fatigue detection — powering automated pedagogical adjustments without recording private video.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: '15px' }}
            >
              Sign In to Demo <ArrowRight size={17} />
            </Link>
            <a
              href="#telemetry"
              className="btn btn-secondary"
              style={{ padding: '12px 24px', fontSize: '15px' }}
            >
              Explore Vision Pipeline
            </a>
          </div>
        </div>

        {/* Live System Preview Frame */}
        <div
          style={{
            maxWidth: '1100px',
            margin: '60px auto 0 auto',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-glass)',
            backgroundColor: 'var(--bg-card)',
            padding: '8px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 50px rgba(99, 102, 241, 0.15)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-dark)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              textAlign: 'left',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Left preview card */}
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Video size={13} /> Active Computer Vision Feed
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>15.0 FPS</span>
              </div>
              <div
                style={{
                  height: '180px',
                  backgroundColor: '#04070E',
                  borderRadius: 'var(--radius-sm)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed rgba(99, 102, 241, 0.3)',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div className="live-pulse-dot" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#A5B4FC' }}>
                    478 Landmarks Tracking
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Iris Gaze · Head Pose · EAR / MAR
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>EAR (Drowsiness)</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#34D399' }}>0.291 (Alert)</div>
                </div>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MAR (Yawn)</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#60A5FA' }}>0.084 (Normal)</div>
                </div>
              </div>
            </div>

            {/* Right preview card */}
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={13} /> Composite Score
                  </span>
                  <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>Optimal Focus</span>
                </div>
                <div style={{ fontSize: '42px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
                  84.6<span style={{ fontSize: '20px', color: 'var(--text-muted)' }}>/100</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '84.6%', height: '100%', background: 'var(--grad-primary)' }} />
                </div>
              </div>

              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={14} color="#818CF8" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#C7D2FE' }}>
                    AI INTERVENTION ENGINE
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  "Engagement dipped by 18% during recursive backtracking. Recommend asking a check-in question or running a quick live poll."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="capabilities" style={{ padding: '80px 24px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="badge badge-info" style={{ marginBottom: '12px' }}>Enterprise Capabilities</span>
            <h2 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFF' }}>
              Built for Modern Academia & Distributed Classrooms
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '620px', margin: '12px auto 0 auto' }}>
              Four specialized systems working in synergy to transform unstructured classroom telemetry into actionable pedagogical intelligence.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            <div className="card" style={{ margin: 0 }}>
              <div className="metric-icon-wrap" style={{ marginBottom: '18px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
                <Eye size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#FFF' }}>
                Multimodal Vision Engine
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.6 }}>
                Simultaneously measures Eye Aspect Ratio (EAR), Mouth Aspect Ratio (MAR), 3D head pose orientation, and iris offset vectors at 15 FPS.
              </p>
            </div>

            <div className="card" style={{ margin: 0 }}>
              <div className="metric-icon-wrap" style={{ marginBottom: '18px', background: 'rgba(6, 182, 212, 0.15)', color: '#22D3EE' }}>
                <TrendingUp size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#FFF' }}>
                Difficulty Correlator
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.6 }}>
                Correlates slide transitions and timestamps with sudden student engagement dips to isolate confusing or over-accelerated curriculum segments.
              </p>
            </div>

            <div className="card" style={{ margin: 0 }}>
              <div className="metric-icon-wrap" style={{ marginBottom: '18px', background: 'rgba(139, 92, 246, 0.15)', color: '#C084FC' }}>
                <Brain size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#FFF' }}>
                Pedagogical Intervention Agent
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.6 }}>
                Synthesizes telemetry dips using LLaMA-3.3 on Groq (with deterministic heuristic fallbacks) to suggest pacing changes, micro-breaks, and polling.
              </p>
            </div>

            <div className="card" style={{ margin: 0 }}>
              <div className="metric-icon-wrap" style={{ marginBottom: '18px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                <ShieldCheck size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#FFF' }}>
                Zero-Footprint Privacy
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.6 }}>
                Video frames are processed transiently in memory. Real student identities are salted and hashed with SHA-256 for complete FERPA compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Telemetry Breakdown */}
      <section id="telemetry" style={{ padding: '80px 24px', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>Deep Tech Pipeline</span>
            <h2 style={{ fontSize: '34px', fontWeight: 800, color: '#FFF' }}>
              How Engagement Is Measured in Real Time
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15.5px', maxWidth: '600px', margin: '8px auto 0 auto' }}>
              A weighted composite model combining four physiological and spatial metrics.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--bg-dark)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: '#818CF8', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', marginBottom: '6px' }}>
                Weight: 30%
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>Iris Gaze Tracking</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                Computes euclidean distance from iris center (landmarks 468, 473) relative to the eye bounding corners.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-dark)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: '#22D3EE', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', marginBottom: '6px' }}>
                Weight: 20%
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>Head Pose Orientation</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                Measures yaw, pitch, and roll angular displacement of the nose bridge and contour relative to the camera viewport.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-dark)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: '#34D399', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', marginBottom: '6px' }}>
                Weight: 25%
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>EAR (Drowsiness)</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                Eye Aspect Ratio detects sustained eye closures (&gt;1.3s threshold) to differentiate intentional blinks from microsleeps.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-dark)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: '#FCD34D', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', marginBottom: '6px' }}>
                Weight: 25%
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>MAR (Yawn Detection)</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                Mouth Aspect Ratio flags sustained mouth vertical expansions (&gt;0.35 threshold) across 10+ consecutive frames.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Workflows */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge badge-info" style={{ marginBottom: '12px' }}>Role-Based Workspaces</span>
            <h2 style={{ fontSize: '34px', fontWeight: 800, color: '#FFF' }}>
              Tailored for Instructors and Students
            </h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
            <button
              onClick={() => setActiveWorkflowTab('teacher')}
              className={`btn ${activeWorkflowTab === 'teacher' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '10px 24px', fontSize: '14px' }}
            >
              Instructor Portal Workflow
            </button>
            <button
              onClick={() => setActiveWorkflowTab('student')}
              className={`btn ${activeWorkflowTab === 'student' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '10px 24px', fontSize: '14px' }}
            >
              Student Portal Workflow
            </button>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px',
            }}
          >
            {activeWorkflowTab === 'teacher' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <CheckCircle2 size={20} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#FFF' }}>Real-Time Class Telemetry</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '3px' }}>
                      Monitor average class focus live without looking at individual video feeds. Immediate alert badges trigger when engagement falls below 50%.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <CheckCircle2 size={20} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#FFF' }}>Post-Lecture Automated Reports</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '3px' }}>
                      Instantly generate 40-minute engagement timelines, state distributions, and printable HTML documents. Dispatch reports directly to advisors via email.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <CheckCircle2 size={20} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#FFF' }}>Anonymized At-Risk Student Outreach</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '3px' }}>
                      Identify consistent multi-week downward trends while respecting student privacy through cryptographic ID obfuscation.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <CheckCircle2 size={20} color="#06B6D4" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#FFF' }}>Personal Focus Telemetry</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '3px' }}>
                      Review personal engagement metrics, focus streak consistency, and trend trajectories across all enrolled university courses.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <CheckCircle2 size={20} color="#06B6D4" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#FFF' }}>Customizable Focus Nudges</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '3px' }}>
                      Configure subtle in-lecture popup reminders, audio chimes, or quiet hour exclusions to gently regain focus when drowsiness sets in.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <CheckCircle2 size={20} color="#06B6D4" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#FFF' }}>Self-Directed Privacy Control</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '3px' }}>
                      Students retain full visibility over their telemetry preferences and can toggle local-only mode versus instructor sharing.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 24px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', background: 'var(--grad-glow)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '38px', fontWeight: 800, color: '#FFF', letterSpacing: '-0.02em', marginBottom: '16px' }}>
            Ready to Experience EngageIQ AI?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6, marginBottom: '32px' }}>
            Explore the live instructor dashboard, inspect session analytics, or test the real-time webcam telemetry engine right now.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '13px 32px', fontSize: '15px' }}>
              Launch Live App <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            EngageIQ AI · Independent Portfolio Project
          </div>
          <div>
            FastAPI · React · PostgreSQL · MediaPipe · Groq LLaMA-3.3
          </div>
        </div>
      </footer>
    </div>
  );
}
