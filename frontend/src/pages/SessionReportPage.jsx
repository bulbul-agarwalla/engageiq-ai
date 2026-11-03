import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import EngagementChart from '../components/EngagementChart';
import StateDistributionChart from '../components/StateDistributionChart';
import { apiFetch } from '../utils/api';
import { formatScore } from '../utils/format';

export default function SessionReportPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewIframe, setViewIframe] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    async function loadReport() {
      try {
        const [repRes, intRes] = await Promise.all([
          apiFetch(`/api/reports/sessions/${id}/data`),
          apiFetch(`/api/reports/sessions/${id}/interventions`),
        ]);

        if (repRes.ok) {
          const json = await repRes.json();
          setData(json);
        } else {
          throw new Error(`Failed to load report data: ${repRes.statusText}`);
        }

        if (intRes.ok) {
          const intJson = await intRes.json();
          setInterventions(intJson.suggestions || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailInput) return;
    setEmailLoading(true);
    setEmailStatus(null);
    try {
      const res = await apiFetch(`/api/reports/sessions/${id}/email`, {
        method: 'POST',
        body: JSON.stringify({ to_email: emailInput }),
      });
      const resJson = await res.json();
      if (res.ok) {
        setEmailStatus({ success: true, message: `Report dispatched successfully to ${emailInput}` });
      } else {
        setEmailStatus({ success: false, message: resJson.detail || 'Failed to dispatch report.' });
      }
    } catch (err) {
      setEmailStatus({ success: false, message: err.message });
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Analyzing session engagement...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}>
        {error}
      </div>
    );
  }

  const timelineChartData = (data?.timeline || []).map((p) => ({
    date: `Min ${p.elapsed_minutes}`,
    average: p.engagement,
  }));

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/reports" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '13px' }}>
              &larr; Back to Sessions
            </Link>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>
            Lecture Report — Session #{data.session.id}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {data.session.course_name} ({data.session.course_code}) · {data.session.start_time}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setViewIframe(!viewIframe)}
            className="btn btn-secondary"
          >
            {viewIframe ? 'View Dashboard View' : 'View Printable HTML'}
          </button>
        </div>
      </div>

      {viewIframe ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <iframe
            src={`/api/reports/sessions/${id}`}
            title="Session Report Preview"
            style={{ width: '100%', height: '800px', border: 'none' }}
          />
        </div>
      ) : (
        <>
          <div className="metrics-grid">
            <MetricCard
              title="Class Engagement"
              value={formatScore(data.class_average)}
              subtitle="Average across all students"
              badgeText={data.class_average >= 70 ? 'High' : 'Low'}
              badgeType={data.class_average >= 70 ? 'success' : 'danger'}
            />
            <MetricCard
              title="Students Observed"
              value={data.session.student_count}
              subtitle="Distinct participants"
            />
            <MetricCard
              title="Telemetry Logs"
              value={data.session.log_count}
              subtitle="Frames analyzed"
            />
            <MetricCard
              title="Duration"
              value={`${data.session.duration_minutes} min`}
              subtitle="Recorded elapsed time"
            />
          </div>

          {/* AI Pedagogical Interventions Section */}
          <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
            <div className="card-header">
              <div>
                <h2 className="card-title">AI Pedagogical Intervention Agent</h2>
                <p style={{ color: '#64748b', fontSize: '13px' }}>
                  Targeted recommendations based on live attention patterns and fatigue indicators.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {interventions.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>
                        {item.type}
                      </span>
                      <span
                        className={`badge ${
                          item.priority === 'high' ? 'badge-danger' : item.priority === 'medium' ? 'badge-warning' : 'badge-info'
                        }`}
                      >
                        {item.priority} priority
                      </span>
                    </div>
                    <div style={{ color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>
                      {item.message}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Confidence</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                      {(item.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div className="card" style={{ margin: 0 }}>
              <div className="card-header">
                <h2 className="card-title">Engagement Timeline</h2>
              </div>
              <EngagementChart data={timelineChartData} dataKey="average" xKey="date" />
            </div>

            <div className="card" style={{ margin: 0 }}>
              <div className="card-header">
                <h2 className="card-title">Engagement States</h2>
              </div>
              <StateDistributionChart data={data.state_distribution} />
            </div>
          </div>

          {/* Email Delivery Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Deliver Report via Email</h2>
            </div>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
              Send a copy of this complete engagement breakdown directly to an instructor or academic advisor.
            </p>
            <form onSubmit={handleSendEmail} style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
              <input
                type="email"
                placeholder="colleague@university.edu"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                }}
              />
              <button
                type="submit"
                disabled={emailLoading || !emailInput}
                className="btn btn-primary"
              >
                {emailLoading ? 'Sending...' : 'Send Report'}
              </button>
            </form>
            {emailStatus && (
              <div
                style={{
                  marginTop: '12px',
                  fontSize: '13px',
                  color: emailStatus.success ? '#15803d' : '#b91c1c',
                }}
              >
                {emailStatus.message}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
