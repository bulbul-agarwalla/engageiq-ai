import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function EngagementChart({ data, dataKey = 'average', xKey = 'date' }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        No historical telemetry points available for chart plotting.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis dataKey={xKey} stroke="#64748B" fontSize={12} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
          <YAxis domain={[0, 100]} stroke="#64748B" fontSize={12} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFF',
              fontSize: '12px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            name="Engagement %"
            stroke="#818CF8"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#engagementGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
