import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        setError('Login failed. Ensure credentials or backend is reachable.');
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
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '40px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
            EngageIQ AI
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>
            Classroom Telemetry & Pedagogical Interventions
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => handleCustomLogin('mock_teacher@engageiq.ai')}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? 'Authenticating...' : 'Sign in as Teacher (Demo)'}
          </button>
          <button
            onClick={() => handleCustomLogin('mock_student@engageiq.ai')}
            disabled={loading}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? 'Authenticating...' : 'Sign in as Student (Demo)'}
          </button>
        </div>

        <div
          style={{
            position: 'relative',
            textAlign: 'center',
            margin: '24px 0',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <span
            style={{
              position: 'relative',
              top: '10px',
              backgroundColor: '#ffffff',
              padding: '0 12px',
              color: '#94a3b8',
              fontSize: '12px',
            }}
          >
            Or authenticate with email
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email) handleCustomLogin(`mock_${email}`);
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}
        >
          <input
            type="email"
            placeholder="name@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
            }}
          />
          <button
            type="submit"
            disabled={loading || !email}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Continue with Email
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <GoogleLoginButton onLoginSuccess={() => navigate('/')} />
        </div>
      </div>
    </div>
  );
}
