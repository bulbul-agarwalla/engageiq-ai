import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import StateDistributionChart from '../components/StateDistributionChart';
import { apiFetch } from '../utils/api';
import { formatScore } from '../utils/format';

export default function CourseDetailPage() {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [difficultyData, setDifficultyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [courseRes, diffRes] = await Promise.all([
          apiFetch(`/api/dashboard/teacher/courses/${id}/overview`),
          apiFetch(`/api/analytics/courses/${id}/difficulty`),
        ]);

        if (courseRes.ok) {
          const json = await courseRes.json();
          setCourseData(json);
        } else {
          throw new Error(`Failed to load course overview: ${courseRes.statusText}`);
        }

        if (diffRes.ok) {
          const diffJson = await diffRes.json();
          setDifficultyData(diffJson);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading course telemetry...</div>;
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/teacher" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '13px' }}>
              &larr; Back to Teacher Overview
            </Link>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>
            {courseData.course_name} ({courseData.course_code})
          </h1>
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Course Engagement Average"
          value={formatScore(courseData.course_average)}
          subtitle="All sessions combined"
        />
        <MetricCard
          title="Total Lectures"
          value={courseData.total_sessions}
          subtitle="Recorded classroom sessions"
        />
        <MetricCard
          title="Students Enrolled"
          value={courseData.total_students}
          subtitle="Active telemetry participants"
        />
        <MetricCard
          title="At-Risk Alerts"
          value={courseData.at_risk_students.length}
          subtitle="Privacy anonymized"
          badgeText={courseData.at_risk_students.length > 0 ? 'Requires Outreach' : 'All Clear'}
          badgeType={courseData.at_risk_students.length > 0 ? 'danger' : 'success'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <h2 className="card-title">Engagement State Distribution</h2>
          </div>
          <StateDistributionChart data={courseData.state_distribution} />
        </div>

        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <h2 className="card-title">At-Risk Student Alerts (Privacy Preserved)</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Anonymous Identifier</th>
                  <th>Average</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {courseData.at_risk_students.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8' }}>
                      No students are currently flagged as at-risk.
                    </td>
                  </tr>
                ) : (
                  courseData.at_risk_students.map((st, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                        {st.anonymized_student_id}
                      </td>
                      <td style={{ color: '#ef4444', fontWeight: '600' }}>
                        {formatScore(st.average_score)}
                      </td>
                      <td>
                        <span className="badge badge-danger">
                          {st.reason || 'Sustained Low Engagement'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Sessions in this Course</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Date</th>
                <th>Class Engagement</th>
                <th>Observations</th>
                <th>Students Present</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {courseData.sessions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8' }}>
                    No sessions recorded for this course.
                  </td>
                </tr>
              ) : (
                courseData.sessions.map((sess) => (
                  <tr key={sess.id}>
                    <td>#{sess.id}</td>
                    <td>{sess.date}</td>
                    <td style={{ fontWeight: '600' }}>{formatScore(sess.average_engagement)}</td>
                    <td>{sess.log_count}</td>
                    <td>{sess.student_count}</td>
                    <td>
                      <Link to={`/reports/sessions/${sess.id}`} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                        View Report & AI Interventions
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
