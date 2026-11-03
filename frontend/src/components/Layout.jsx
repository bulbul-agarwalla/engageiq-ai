import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  Brain,
  LayoutDashboard,
  Video,
  FileBarChart,
  Download,
  Sliders,
  LogOut,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isTeacher = user?.role === 'teacher';
  const userInitials = (user?.name || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Brain size={19} color="#FFFFFF" />
            </div>
            <span>EngageIQ</span>
            <span className="sidebar-badge">AI</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">
            {isTeacher ? 'Instructor Portal' : 'Student Workspace'}
          </div>

          {isTeacher ? (
            <>
              <NavLink
                to="/teacher"
                end
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Instructor Overview</span>
              </NavLink>

              <NavLink
                to="/teacher/live"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Video size={18} />
                <span>Live Lecture Room</span>
                <span className="live-pulse-dot" style={{ marginLeft: 'auto' }} />
              </NavLink>

              <NavLink
                to="/reports"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <FileBarChart size={18} />
                <span>Session Reports</span>
              </NavLink>

              <NavLink
                to="/export"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Download size={18} />
                <span>Export Telemetry</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/student"
                end
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Focus Analytics</span>
              </NavLink>

              <NavLink
                to="/settings/nudge"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Sliders size={18} />
                <span>Nudge Preferences</span>
              </NavLink>
            </>
          )}

          <div className="nav-section-title" style={{ marginTop: '16px' }}>
            Resources
          </div>
          <Link to="/" className="nav-item">
            <ExternalLink size={18} />
            <span>Product Overview</span>
          </Link>
        </nav>

        {/* Sidebar Footer with User Details */}
        <div className="sidebar-footer">
          <div className="user-profile-widget">
            <div className="user-avatar">{userInitials}</div>
            <div style={{ fontSize: '13px', lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{user?.name || 'User'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'capitalize' }}>
                {user?.role || 'Guest'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F43F5E')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              className="badge badge-success"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span className="live-pulse-dot" style={{ background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
              Telemetry Engine: Online
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              PostgreSQL · MediaPipe XNNPACK · Groq LLaMA-3.3
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {isTeacher && (
              <Link to="/teacher/live" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '13px' }}>
                <Video size={14} /> Start Live Lecture
              </Link>
            )}
            <span className={`badge ${isTeacher ? 'badge-info' : 'badge-cyan'}`}>
              {isTeacher ? 'Instructor Portal' : 'Student Portal'}
            </span>
          </div>
        </header>

        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
