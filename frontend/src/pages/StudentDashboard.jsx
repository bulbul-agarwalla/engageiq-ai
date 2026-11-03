import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Award,
  TrendingUp,
  Sliders,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import EngagementChart from '../components/EngagementChart';
import { apiFetch } from '../utils/api';
import { formatScore } from '../utils/format';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await apiFetch('/api/dashboard/student');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError(`Failed to fetch student data: ${res.statusText}`);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="live-pulse-dot" style={{ margin: '0 auto 12px auto' }} />
        Loading your personal learning telemetry...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ color: '#FDA4AF', backgroundColor: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
        {error}
      </div>
    );
  }

  const chartData = (data?.recent_sessions || []).map((s) => ({
    date: s.date,
    average: s.student_average,
  })).reverse();

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-cyan">Student Workspace</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Self-Directed Focus Profile
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Welcome back, {data?.user_name || 'Alex Rivera'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Your personal classroom attention telemetry, focus streak consistency, and intelligent study suggestions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/settings/nudge" className="btn btn-secondary">
            <Sliders size={15} /> Customize Nudges
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          title="Overall Focus Score"
          value={formatScore(data?.overall_average)}
          subtitle="Across all university lectures"
          badgeText={data?.trend?.toUpperCase()}
          badgeType={data?.trend === 'improving' ? 'success' : data?.trend === 'declining' ? 'danger' : 'info'}
        />
        <MetricCard
          title="Focus Streak"
          value={`${data?.focus_streak || 0} Lectures`}
          subtitle="Consecutive sessions >= 70%"
          badgeText="Active Streak"
          badgeType="success"
        />
        <MetricCard
          title="Lectures Attended"
          value={data?.total_sessions || 0}
          subtitle="Recorded telemetry sessions"
        />
        <MetricCard
          title="Trend Trajectory"
          value={data?.trend_slope ? `${data.trend_slope > 0 ? '+' : ''}${data.trend_slope}` : '0.0'}
          subtitle="Engagement gradient"
          badgeText={data?.trend || 'stable'}
          badgeType="info"
        />
      </div>

      {/* Focus Recommendations Card */}
      <div className="card" style={{ borderLeft: '4px solid #06B6D4' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#22D3EE" /> Personalized Learning & Focus Tips
            </h2>
            <div className="card-subtitle">
              Generated automatically from your classroom posture and fatigue indicators.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '14px', marginBottom: '4px' }}>
              Mid-Lecture Attention Sustained
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
              Your attention peaks between minutes 5–20. For topics in minute 25+, consider jotting down hand-written summary notes to maintain active posture.
            </p>
          </div>

          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '14px', marginBottom: '4px' }}>
              Nudge Notification Sensitivity
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
              Your current quiet hours are configured to avoid interruptions during discussion intervals. You can adjust your vibration/popup threshold in settings.
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <TrendingUp size={18} color="#818CF8" /> Focus Progression Over Recent Sessions
            </h2>
            <div className="card-subtitle">Your personal engagement trajectory over time.</div>
          </div>
        </div>
        <EngagementChart data={chartData} dataKey="average" xKey="date" />
      </div>

      {/* Sessions Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Clock size={18} color="#06B6D4" /> Your Attended Sessions Log
            </h2>
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Lecture Date</th>
                <th>Course Name</th>
                <th>Course Code</th>
                <th>Your Mean Focus</th>
                <th>Status</th>
                <th>Session ID</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recent_sessions || []).length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '28px' }}>
                    No sessions recorded yet. Start participating in live lectures!
                  </td>
                </tr>
              ) : (
                data.recent_sessions.map((s) => (
                  <tr key={s.session_id}>
                    <td>{s.date}</td>
                    <td style={{ fontWeight: 600, color: '#FFF' }}>{s.course_name}</td>
                    <td>
                      <span className="badge badge-info">{s.course_code}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: s.student_average >= 70 ? '#34D399' : '#FCD34D' }}>
                      {formatScore(s.student_average)}
                    </td>
                    <td>
                      <span className={`badge ${s.student_average >= 70 ? 'badge-success' : 'badge-warning'}`}>
                        {s.student_average >= 70 ? 'Focused' : 'Review Topic'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>#{s.session_id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
