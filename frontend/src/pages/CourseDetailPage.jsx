import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Video,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  FileBarChart,
  Activity,
  Layers,
} from 'lucide-react';
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
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="live-pulse-dot" style={{ margin: '0 auto 12px auto' }} />
        Analyzing course telemetry...
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
          <Link
            to="/teacher"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#818CF8',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} /> Back to Teacher Overview
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', marginTop: '6px', letterSpacing: '-0.02em' }}>
            {courseData.course_name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span className="badge badge-info">{courseData.course_code}</span>
            <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              Curriculum Telemetry Analysis
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to={`/teacher/live?courseId=${id}`} className="btn btn-primary">
            <Video size={16} /> Start Lecture for this Course
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          title="Course Engagement Average"
          value={formatScore(courseData.course_average)}
          subtitle="Mean across all lectures"
          badgeText={courseData.course_average >= 70 ? 'High' : 'Needs Focus'}
          badgeType={courseData.course_average >= 70 ? 'success' : 'warning'}
        />
        <MetricCard
          title="Lectures Recorded"
          value={courseData.total_sessions}
          subtitle="Classroom sessions in database"
        />
        <MetricCard
          title="Students Enrolled"
          value={courseData.total_students}
          subtitle="Active telemetry participants"
        />
        <MetricCard
          title="At-Risk Alerts"
          value={courseData.at_risk_students.length}
          subtitle="Multi-session drop rate"
          badgeText={courseData.at_risk_students.length > 0 ? 'Requires Outreach' : 'All Clear'}
          badgeType={courseData.at_risk_students.length > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Two Column Section: State Distribution & At-Risk Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Activity size={18} color="#06B6D4" /> Attention State Breakdown
              </h2>
              <div className="card-subtitle">Aggregated distribution across enrolled students.</div>
            </div>
          </div>
          <StateDistributionChart data={courseData.state_distribution} />
        </div>

        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <AlertTriangle size={18} color="#F43F5E" /> At-Risk Student Outreach
              </h2>
              <div className="card-subtitle">Cryptographically anonymized with SHA-256 for privacy.</div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Anonymous Identifier</th>
                  <th>Mean Score</th>
                  <th>Intervention Status</th>
                </tr>
              </thead>
              <tbody>
                {courseData.at_risk_students.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No students are currently flagged as at-risk.
                    </td>
                  </tr>
                ) : (
                  courseData.at_risk_students.map((st, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#C7D2FE' }}>
                        {st.anonymized_student_id}
                      </td>
                      <td style={{ color: '#FDA4AF', fontWeight: 700 }}>
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

      {/* Sessions Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <FileBarChart size={18} color="#818CF8" /> Recorded Lectures in this Course
            </h2>
            <div className="card-subtitle">
              Select any session to review 40-minute timelines, difficulty dips, and AI recommendations.
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Recorded Date</th>
                <th>Class Engagement</th>
                <th>Telemetry Frames</th>
                <th>Students Present</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {courseData.sessions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '28px' }}>
                    No sessions recorded for this course yet.
                  </td>
                </tr>
              ) : (
                courseData.sessions.map((sess) => (
                  <tr key={sess.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>#{sess.id}</td>
                    <td>{sess.date}</td>
                    <td style={{ fontWeight: 700, color: sess.average_engagement >= 70 ? '#34D399' : '#FCD34D' }}>
                      {formatScore(sess.average_engagement)}
                    </td>
                    <td>{sess.log_count} frames</td>
                    <td>{sess.student_count} students</td>
                    <td>
                      <Link
                        to={`/reports/sessions/${sess.id}`}
                        className="btn btn-secondary"
                        style={{ padding: '5px 12px', fontSize: '12px' }}
                      >
                        Inspect Report <ChevronRight size={14} />
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
