import React, { useState } from 'react';
import { Download, Database, ShieldCheck, Calendar, Filter, FileSpreadsheet } from 'lucide-react';
import ExportButton from '../components/ExportButton';

export default function ExportPage() {
  const [resourceType, setResourceType] = useState('session');
  const [resourceId, setResourceId] = useState('1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [studentId, setStudentId] = useState('');

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-info">Accreditation & Portability</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Institutional Data Export</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Data Portability & Analytics Export
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Export raw telemetry datasets for NAAC / ABET accreditation, institutional research, or offline spreadsheet analysis.
        </p>
      </div>

      <div className="card" style={{ maxWidth: '680px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Filter size={18} color="#818CF8" /> Configure Export Query
            </h2>
            <div className="card-subtitle">
              Select granular parameters or export the entire lecture telemetry dataset.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#FFF', marginBottom: '8px' }}>
              Resource Scope
            </label>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', color: '#FFF' }}>
                <input
                  type="radio"
                  name="resourceType"
                  value="session"
                  checked={resourceType === 'session'}
                  onChange={() => {
                    setResourceType('session');
                    if (resourceId === '') setResourceId('1');
                  }}
                />
                Session Telemetry (Single Lecture)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', color: '#FFF' }}>
                <input
                  type="radio"
                  name="resourceType"
                  value="course"
                  checked={resourceType === 'course'}
                  onChange={() => {
                    setResourceType('course');
                    if (resourceId === '') setResourceId('1');
                  }}
                />
                Course Telemetry (Entire Semester)
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#FFF', marginBottom: '6px' }}>
              {resourceType === 'session' ? 'Session ID' : 'Course ID'} *
            </label>
            <input
              type="number"
              placeholder="e.g. 1"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#FFF', marginBottom: '6px' }}>
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#FFF', marginBottom: '6px' }}>
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#FFF', marginBottom: '6px' }}>
              Student ID Filter (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 12 or anonymous hash"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={{ width: '100%' }}
            />
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={14} color="#10B981" />
              Cryptographic anonymization: All student IDs are hashed with SHA-256 before download.
            </div>
          </div>

          <div style={{ marginTop: '12px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
            <ExportButton
              type={resourceType}
              id={resourceId}
              startDate={startDate}
              endDate={endDate}
              studentId={studentId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
