import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Brain,
  GraduationCap,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleCustomLogin = async (credential) => {
    setLoading(true);
    setError(null);
    try {
      const success = await login(credential);
      if (success) {
        navigate('/');
      } else {
        setError('Authentication failed. Ensure backend server is reachable.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        backgroundImage: `
          radial-gradient(at 20% 20%, rgba(99, 102, 241, 0.12) 0px, transparent 50%),
          radial-gradient(at 80% 80%, rgba(6, 182, 212, 0.08) 0px, transparent 50%)
        `,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 36px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.1)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              marginBottom: '16px',
            }}
          >
            <div className="sidebar-logo-icon">
              <Brain size={20} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              EngageIQ <span className="sidebar-badge">AI</span>
            </span>
          </Link>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
            Welcome to Classroom Telemetry
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '6px' }}>
            Choose a verified demo persona or sign in with your academic email.
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#FDA4AF',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {/* 1-Click Demo Personas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => handleCustomLogin('mock_teacher@engageiq.ai')}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: 'var(--radius-md)',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(99, 102, 241, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A5B4FC',
                }}
              >
                <GraduationCap size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>Instructor Experience</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Dr. Angela Smith · Multi-Course Telemetry
                </div>
              </div>
            </div>
            <ChevronRight size={18} color="#818CF8" />
          </button>

          <button
            type="button"
            onClick={() => handleCustomLogin('mock_student@engageiq.ai')}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.16)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(6, 182, 212, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#67E8F9',
                }}
              >
                <User size={19} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>Student Experience</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Alex Rivera · Personal Focus & Nudges
                </div>
              </div>
            </div>
            <ChevronRight size={18} color="#22D3EE" />
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            position: 'relative',
            textAlign: 'center',
            margin: '24px 0',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <span
            style={{
              position: 'relative',
              top: '9px',
              backgroundColor: 'var(--bg-card)',
              padding: '0 12px',
              color: 'var(--text-muted)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Or authenticate with email
          </span>
        </div>

        {/* Email form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email) handleCustomLogin(`mock_${email}`);
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <div>
            <input
              type="email"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '11px 14px' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !email}
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In with Email'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <GoogleLoginButton onLoginSuccess={() => navigate('/')} />
        </div>

        {/* Privacy Note */}
        <div
          style={{
            marginTop: '28px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            fontSize: '12px',
          }}
        >
          <ShieldCheck size={14} color="#10B981" />
          FERPA & Privacy-First: Telemetry processed in-memory
        </div>
      </div>
    </div>
  );
}
