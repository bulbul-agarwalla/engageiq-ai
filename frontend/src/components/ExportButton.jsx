import React, { useState } from 'react';
import { Download, AlertCircle } from 'lucide-react';

export default function ExportButton({
  type = 'session', // "session" or "course"
  id,
  startDate = '',
  endDate = '',
  studentId = '',
  baseUrl = '/api/export',
  className = '',
  style = {},
}) {
  const [format, setFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    if (!id) {
      setError('Please provide a valid Session ID or Course ID to export.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpointType = type === 'course' ? 'courses' : 'sessions';
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);

      if (startDate) queryParams.append('start', startDate);
      if (endDate) queryParams.append('end', endDate);
      if (studentId) queryParams.append('student_id', studentId);

      const url = `${baseUrl}/${endpointType}/${id}?${queryParams.toString()}`;

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        let errMessage = `Export failed with status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.detail) {
            errMessage =
              typeof errData.detail === 'string'
                ? errData.detail
                : JSON.stringify(errData.detail);
          }
        } catch (_) {
          // not json
        }
        throw new Error(errMessage);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${type}_${id}_export.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=["']?([^"';]+)["']?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err.message || 'An error occurred during export.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`export-button-container ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: '6px',
        ...style,
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          disabled={loading}
          aria-label="Export format"
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13.5px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          <option value="csv">CSV (Spreadsheet)</option>
          <option value="json">JSON (Raw Telemetry)</option>
        </select>

        <button
          onClick={handleExport}
          disabled={loading || !id}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '13.5px' }}
        >
          <Download size={15} />
          {loading ? 'Exporting...' : `Download ${format.toUpperCase()}`}
        </button>
      </div>

      {error && (
        <span
          style={{
            color: '#FDA4AF',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '4px',
          }}
        >
          <AlertCircle size={14} /> {error}
        </span>
      )}
    </div>
  );
}
