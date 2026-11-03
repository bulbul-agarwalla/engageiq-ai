import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { getStateColor } from '../utils/format';

export default function StateDistributionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        No state telemetry records available.
      </div>
    );
  }

  // Handle either object { engaged: 40, passive: 20... } or array [{ state, count }...]
  const chartData = Array.isArray(data)
    ? data.map((d) => ({
        name: d.state,
        value: d.count,
        color: getStateColor(d.state),
      }))
    : Object.entries(data).map(([state, val]) => ({
        name: state,
        value: typeof val === 'number' ? val : 0,
        color: getStateColor(state),
      }));

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={82}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
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
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(val) => <span style={{ color: '#94A3B8', fontSize: '12px', textTransform: 'capitalize' }}>{val}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
