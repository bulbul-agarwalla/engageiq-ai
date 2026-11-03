import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function EngagementChart({ data, dataKey = 'average', xKey = 'date' }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8' }}>
        No historical telemetry points available for chart plotting.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            name="Engagement %"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4, fill: '#2563eb' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
