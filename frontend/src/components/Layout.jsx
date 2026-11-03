import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isTeacher = user?.role === 'teacher';

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span>EngageIQ</span>
            <span className="sidebar-badge">AI</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {isTeacher ? (
            <>
              <NavLink
                to="/teacher"
                end
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span>Teacher Overview</span>
              </NavLink>
              <NavLink
                to="/reports"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span>Lecture Reports</span>
              </NavLink>
              <NavLink
                to="/export"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
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
                <span>Student Dashboard</span>
              </NavLink>
              <NavLink
                to="/settings/nudge"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span>Nudge Preferences</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: '13px' }}>
            <div style={{ fontWeight: '600', color: '#fff' }}>{user?.name || 'User'}</div>
            <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'capitalize' }}>
              {user?.role || 'Guest'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Classroom AI Engagement Platform
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={`badge ${isTeacher ? 'badge-info' : 'badge-success'}`}>
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
