import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading instructor analytics...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
            Instructor Overview — {data?.teacher_name || 'Professor'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Comprehensive telemetry across your active lecture sections.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/export" className="btn btn-secondary">
            Export Analytics
          </Link>
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Class Average Engagement"
          value={formatScore(data?.overall_average)}
          subtitle="Mean across all courses"
          badgeText={data?.overall_average >= 70 ? 'Optimal' : 'Needs Focus'}
          badgeType={data?.overall_average >= 70 ? 'success' : 'warning'}
        />
        <MetricCard
          title="At-Risk Alerts"
          value={data?.total_at_risk || 0}
          subtitle="Students with sustained dips"
          badgeText={data?.total_at_risk > 0 ? 'Action Required' : 'None'}
          badgeType={data?.total_at_risk > 0 ? 'danger' : 'success'}
        />
        <MetricCard
          title="Active Courses"
          value={data?.total_courses || 0}
          subtitle="Registered curriculum"
        />
        <MetricCard
          title="Total Lectures Logged"
          value={data?.total_sessions || 0}
          subtitle="Recorded classroom sessions"
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Your Courses</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Code</th>
                <th>Sessions</th>
                <th>Enrolled Students</th>
                <th>Avg Engagement</th>
                <th>At-Risk</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(data?.courses || []).length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8' }}>
                    No courses found. Create or sync a course to view telemetry.
                  </td>
                </tr>
              ) : (
                data.courses.map((course) => (
                  <tr key={course.id}>
                    <td style={{ fontWeight: '600' }}>{course.name}</td>
                    <td><span className="badge badge-info">{course.code}</span></td>
                    <td>{course.session_count}</td>
                    <td>{course.student_count}</td>
                    <td style={{ fontWeight: '600' }}>{formatScore(course.average_engagement)}</td>
                    <td>
                      {course.at_risk_students > 0 ? (
                        <span className="badge badge-danger">{course.at_risk_students} flagged</span>
                      ) : (
                        <span className="badge badge-success">None</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/teacher/courses/${course.id}`} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                        View Deep Dive
                      </Link>
                    </td>
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
