import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { getStateColor } from '../utils/format';

export default function StateDistributionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8' }}>
        No state telemetry records available.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.state,
    value: d.count,
    color: getStateColor(d.state),
  }));

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(val) => <span style={{ color: '#475467', fontSize: '12px' }}>{val}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
