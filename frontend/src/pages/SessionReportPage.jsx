import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Mail,
  Printer,
  Sparkles,
  ArrowLeft,
  Activity,
  Layers,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
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
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="live-pulse-dot" style={{ margin: '0 auto 12px auto' }} />
        Analyzing session engagement telemetry...
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

  const timelineChartData = (data?.timeline || []).map((p) => ({
    date: `Min ${p.elapsed_minutes}`,
    average: p.engagement,
  }));

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
            to="/reports"
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
            <ArrowLeft size={14} /> Back to Session Directory
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', marginTop: '6px', letterSpacing: '-0.02em' }}>
            Lecture Report — Session #{data.session.id}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span className="badge badge-info">{data.session.course_code}</span>
            <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              {data.session.course_name} · {data.session.start_time}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setViewIframe(!viewIframe)}
            className="btn btn-secondary"
          >
            <Printer size={15} /> {viewIframe ? 'Interactive Dashboard View' : 'Printable HTML Document'}
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
          {/* Top Summary Metrics */}
          <div className="metrics-grid">
            <MetricCard
              title="Class Engagement Average"
              value={formatScore(data.class_average)}
              subtitle="Mean focus over duration"
              badgeText={data.class_average >= 70 ? 'High' : 'Low Attention'}
              badgeType={data.class_average >= 70 ? 'success' : 'danger'}
            />
            <MetricCard
              title="Students Observed"
              value={data.session.student_count}
              subtitle="Distinct participants"
            />
            <MetricCard
              title="Telemetry Observations"
              value={data.session.log_count}
              subtitle="In-flight frames analyzed"
            />
            <MetricCard
              title="Duration"
              value={`${data.session.duration_minutes} min`}
              subtitle="Recorded lecture length"
            />
          </div>

          {/* AI Pedagogical Intervention Agent */}
          <div className="card" style={{ borderLeft: '4px solid #6366F1' }}>
            <div className="card-header">
              <div>
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={19} color="#818CF8" /> AI Pedagogical Intervention Agent
                </h2>
                <div className="card-subtitle">
                  Synthesized recommendations based on physiological attention dips and fatigue indicators.
                </div>
              </div>
              <span className="badge badge-info">LLaMA-3.3 + Heuristic Engine</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {interventions.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13.5px', padding: '12px' }}>
                  No interventions required — class demonstrated high focus consistency throughout the session.
                </div>
              ) : (
                interventions.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ maxWidth: '80%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span className="badge badge-cyan" style={{ textTransform: 'uppercase' }}>
                          {item.type}
                        </span>
                        <span
                          className={`badge ${
                            item.priority === 'high'
                              ? 'badge-danger'
                              : item.priority === 'medium'
                              ? 'badge-warning'
                              : 'badge-info'
                          }`}
                        >
                          {item.priority} priority
                        </span>
                      </div>
                      <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500, lineHeight: 1.5 }}>
                        {item.message}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '90px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Confidence</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#A5B4FC' }}>
                        {(item.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Timeline and State Distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div className="card" style={{ margin: 0 }}>
              <div className="card-header">
                <div>
                  <h2 className="card-title">
                    <Activity size={18} color="#818CF8" /> 40-Minute Engagement Timeline
                  </h2>
                  <div className="card-subtitle">Continuous moving average across the lecture.</div>
                </div>
              </div>
              <EngagementChart data={timelineChartData} dataKey="average" xKey="date" />
            </div>

            <div className="card" style={{ margin: 0 }}>
              <div className="card-header">
                <div>
                  <h2 className="card-title">
                    <Layers size={18} color="#06B6D4" /> Attention State Distribution
                  </h2>
                  <div className="card-subtitle">Engaged vs Passive vs Drowsy proportions.</div>
                </div>
              </div>
              <StateDistributionChart data={data.state_distribution} />
            </div>
          </div>

          {/* Email Dispatch Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">
                  <Mail size={18} color="#818CF8" /> Deliver Report via Email
                </h2>
                <div className="card-subtitle">
                  Send a complete HTML copy of this report directly to a colleague, advisor, or department chair.
                </div>
              </div>
            </div>

            <form onSubmit={handleSendEmail} style={{ display: 'flex', gap: '12px', maxWidth: '520px', flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder="colleague@university.edu"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ flex: 1, minWidth: '240px' }}
              />
              <button
                type="submit"
                disabled={emailLoading || !emailInput}
                className="btn btn-primary"
              >
                <Mail size={15} /> {emailLoading ? 'Sending...' : 'Send Report'}
              </button>
            </form>

            {emailStatus && (
              <div
                style={{
                  marginTop: '14px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: emailStatus.success ? '#34D399' : '#FDA4AF',
                }}
              >
                {emailStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {emailStatus.message}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
