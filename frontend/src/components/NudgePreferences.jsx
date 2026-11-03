import React, { useEffect, useState } from 'react';
import { Sliders, Bell, Eye, Volume2, Clock, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function NudgePreferences() {
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const userRes = await apiFetch('/api/v1/users/me');
        if (!userRes.ok) throw new Error('Could not fetch user profile');
        const me = await userRes.json();
        setUser(me);

        const prefRes = await apiFetch(`/api/preferences/${me.id}`);
        if (prefRes.ok) {
          const p = await prefRes.json();
          setPrefs(p);
        } else {
          // Default initial preferences if not exists
          setPrefs({
            notification_enabled: true,
            overlay_enabled: true,
            audio_enabled: false,
            quiet_hours_start: '12:00',
            quiet_hours_end: '13:00',
            sensitivity: 'normal',
          });
        }
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Unable to load preferences' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !prefs) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="live-pulse-dot" style={{ margin: '0 auto 12px auto' }} />
        Loading nudge preferences...
      </div>
    );
  }

  const setField = (k, v) => setPrefs((s) => ({ ...s, [k]: v }));

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await apiFetch(`/api/preferences/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(prefs),
      });
      if (!res.ok) throw new Error('Failed to update preferences on server.');
      const updated = await res.json();
      setPrefs(updated);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 740, margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-cyan">Focus Settings</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Student Telemetry Controls</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Classroom Focus Nudge Preferences
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Configure how and when the AI platform gently prompts you if sustained inattention or fatigue is detected.
        </p>
      </div>

      <div className="card">
        {/* Section 1: Channels */}
        <div style={{ marginBottom: '28px' }}>
          <h2 className="card-title" style={{ fontSize: '16px', marginBottom: '14px' }}>
            <Bell size={18} color="#818CF8" /> Notification Channels
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={prefs.notification_enabled}
                onChange={(e) => setField('notification_enabled', e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <div>
                <div style={{ fontWeight: 600, color: '#FFF', fontSize: '14px' }}>Browser Notification</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                  Subtle slide-in notification when focus drops below threshold.
                </div>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={prefs.overlay_enabled}
                onChange={(e) => setField('overlay_enabled', e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <div>
                <div style={{ fontWeight: 600, color: '#FFF', fontSize: '14px' }}>Visual Screen Overlay</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                  Soft ambient glow indicator along viewport borders.
                </div>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={prefs.audio_enabled}
                onChange={(e) => setField('audio_enabled', e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <div>
                <div style={{ fontWeight: 600, color: '#FFF', fontSize: '14px' }}>Audio Alert Chime</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                  Low-frequency gentle chime on sustained drowsiness.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Section 2: Quiet Hours */}
        <div style={{ marginBottom: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
          <h2 className="card-title" style={{ fontSize: '16px', marginBottom: '14px' }}>
            <Clock size={18} color="#22D3EE" /> Quiet Hours (No Interruptions)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
            Specify daily time intervals where all focus reminders and overlay notifications are muted.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '420px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Start Time
              </label>
              <input
                type="time"
                value={prefs.quiet_hours_start || ''}
                onChange={(e) => setField('quiet_hours_start', e.target.value || null)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                End Time
              </label>
              <input
                type="time"
                value={prefs.quiet_hours_end || ''}
                onChange={(e) => setField('quiet_hours_end', e.target.value || null)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Sensitivity */}
        <div style={{ marginBottom: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
          <h2 className="card-title" style={{ fontSize: '16px', marginBottom: '14px' }}>
            <Sliders size={18} color="#C084FC" /> Detection Sensitivity
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {['less', 'normal', 'more'].map((lvl) => (
              <label
                key={lvl}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px',
                  backgroundColor: prefs.sensitivity === lvl ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${prefs.sensitivity === lvl ? '#6366F1' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontWeight: 600,
                  color: prefs.sensitivity === lvl ? '#A5B4FC' : '#FFF',
                }}
              >
                <input
                  type="radio"
                  name="sensitivity"
                  value={lvl}
                  checked={prefs.sensitivity === lvl}
                  onChange={() => setField('sensitivity', lvl)}
                />
                {lvl} Sensitivity
              </label>
            ))}
          </div>
        </div>

        {/* Save button & feedback */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={save} disabled={saving} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={16} /> {saving ? 'Saving Preferences...' : 'Save Preferences'}
          </button>
          {message && (
            <div
              style={{
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: message.type === 'error' ? '#FDA4AF' : '#34D399',
              }}
            >
              {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
