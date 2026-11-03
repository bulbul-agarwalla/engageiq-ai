import React, { useState } from 'react';
import ExportButton from '../components/ExportButton';

export default function ExportPage() {
  const [resourceType, setResourceType] = useState('session');
  const [resourceId, setResourceId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [studentId, setStudentId] = useState('');

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
          Data Portability & Analytics Export
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Export raw telemetry for NAAC accreditation, institutional research, or offline spreadsheet analysis.
        </p>
      </div>

      <div className="card" style={{ maxWidth: '640px' }}>
        <div className="card-header">
          <h2 className="card-title">Configure Export Query</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475467', marginBottom: '6px' }}>
              Resource Type
            </label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="resourceType"
                  value="session"
                  checked={resourceType === 'session'}
                  onChange={() => setResourceType('session')}
                />
                Session Export
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="resourceType"
                  value="course"
                  checked={resourceType === 'course'}
                  onChange={() => setResourceType('course')}
                />
                Course Export
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475467', marginBottom: '6px' }}>
              {resourceType === 'session' ? 'Session ID' : 'Course ID'} *
            </label>
            <input
              type="number"
              placeholder="e.g. 1"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475467', marginBottom: '6px' }}>
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475467', marginBottom: '6px' }}>
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475467', marginBottom: '6px' }}>
              Student Filter (Optional, Real or Anonymized ID)
            </label>
            <input
              type="text"
              placeholder="e.g. 12 or anon_a1b2c3d4"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
              }}
            />
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Note: Privacy is strictly enforced. Student IDs are anonymized in all exported files.
            </div>
          </div>

          <div style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
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
