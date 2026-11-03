import React, { useEffect, useState } from 'react';
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
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading student metrics...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}>
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
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
          Welcome back, {data?.user_name || 'Student'}
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Here is your personal classroom engagement profile and focus trends.
        </p>
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Overall Engagement"
          value={formatScore(data?.overall_average)}
          subtitle="Across all lecture sessions"
          badgeText={data?.trend?.toUpperCase()}
          badgeType={data?.trend === 'improving' ? 'success' : data?.trend === 'declining' ? 'danger' : 'info'}
        />
        <MetricCard
          title="Focus Streak"
          value={`${data?.focus_streak || 0} Sessions`}
          subtitle="Consecutive sessions >= 70%"
          badgeText="Streak"
          badgeType="success"
        />
        <MetricCard
          title="Sessions Attended"
          value={data?.total_sessions || 0}
          subtitle="Logged telemetry records"
        />
        <MetricCard
          title="Trend Trajectory"
          value={data?.trend_slope ? `${data.trend_slope > 0 ? '+' : ''}${data.trend_slope}` : '0.0'}
          subtitle="Engagement slope"
          badgeText={data?.trend}
          badgeType="info"
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Engagement Over Recent Sessions</h2>
        </div>
        <EngagementChart data={chartData} dataKey="average" xKey="date" />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Session Logs</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Code</th>
                <th>Your Average</th>
                <th>Session ID</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recent_sessions || []).length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>
                    No sessions recorded yet. Start participating in lectures!
                  </td>
                </tr>
              ) : (
                data.recent_sessions.map((s) => (
                  <tr key={s.session_id}>
                    <td>{s.date}</td>
                    <td style={{ fontWeight: '500' }}>{s.course_name}</td>
                    <td><span className="badge badge-info">{s.course_code}</span></td>
                    <td style={{ fontWeight: '600' }}>{formatScore(s.student_average)}</td>
                    <td>#{s.session_id}</td>
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
