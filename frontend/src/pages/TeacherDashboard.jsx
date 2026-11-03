import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Video,
  Download,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  ChevronRight,
  Plus,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { apiFetch } from '../utils/api';
import { formatScore } from '../utils/format';

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await apiFetch('/api/dashboard/teacher');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError(`Failed to fetch instructor dashboard: ${res.statusText}`);
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
        Loading instructor analytics...
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

  return (
    <div>
      {/* Welcome Banner */}
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
            <span className="badge badge-info">Instructor Hub</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Semester Term 2026
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Instructor Overview — {data?.teacher_name || 'Professor'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Telemetry, real-time attention distributions, and automated interventions across active lecture sections.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/teacher/live" className="btn btn-primary">
            <Video size={16} /> Launch Live Lecture
          </Link>
          <Link to="/export" className="btn btn-secondary">
            <Download size={16} /> Export Telemetry
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          title="Overall Engagement Average"
          value={formatScore(data?.overall_average)}
          subtitle="Mean across all lecture sessions"
          badgeText={data?.overall_average >= 70 ? 'Optimal' : 'Needs Focus'}
          badgeType={data?.overall_average >= 70 ? 'success' : 'warning'}
        />
        <MetricCard
          title="At-Risk Alerts"
          value={data?.total_at_risk || 0}
          subtitle="Students with multi-session drops"
          badgeText={data?.total_at_risk > 0 ? 'Outreach Advised' : 'All Clear'}
          badgeType={data?.total_at_risk > 0 ? 'danger' : 'success'}
        />
        <MetricCard
          title="Registered Courses"
          value={data?.total_courses || 0}
          subtitle="Curriculum sections active"
        />
        <MetricCard
          title="Lectures Recorded"
          value={data?.total_sessions || 0}
          subtitle="Telemetry sessions stored in DB"
        />
      </div>

      {/* Course Sections Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <BookOpen size={18} color="#818CF8" /> Active Curriculum Sections
            </h2>
            <div className="card-subtitle">
              Click any section below to drill into session timelines and student attention patterns.
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Code</th>
                <th>Sessions</th>
                <th>Enrolled</th>
                <th>Avg Engagement</th>
                <th>Health Bar</th>
                <th>At-Risk Alerts</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(data?.courses || []).length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                    No active courses found.
                  </td>
                </tr>
              ) : (
                data.courses.map((course) => {
                  const avg = course.average_engagement || 0;
                  return (
                    <tr key={course.id}>
                      <td style={{ fontWeight: 600, color: '#FFF' }}>{course.name}</td>
                      <td>
                        <span className="badge badge-info">{course.code}</span>
                      </td>
                      <td>{course.session_count} lectures</td>
                      <td>{course.student_count} students</td>
                      <td style={{ fontWeight: 700, color: avg >= 70 ? '#34D399' : '#FCD34D' }}>
                        {formatScore(avg)}
                      </td>
                      <td style={{ width: '130px' }}>
                        <div
                          style={{
                            height: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, avg)}%`,
                              height: '100%',
                              background: avg >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        {course.at_risk_students > 0 ? (
                          <span className="badge badge-danger">
                            <AlertTriangle size={12} /> {course.at_risk_students} flagged
                          </span>
                        ) : (
                          <span className="badge badge-success">0 flagged</span>
                        )}
                      </td>
                      <td>
                        <Link
                          to={`/teacher/courses/${course.id}`}
                          className="btn btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '12px' }}
                        >
                          Deep Dive <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
