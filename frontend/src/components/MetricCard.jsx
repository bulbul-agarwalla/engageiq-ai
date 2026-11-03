import React from 'react';

export default function MetricCard({ title, value, subtitle, badgeText, badgeType = 'info' }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span className="metric-label">{title}</span>
        {badgeText && <span className={`badge badge-${badgeType}`}>{badgeText}</span>}
      </div>
      <div className="metric-value">{value}</div>
      {subtitle && <div className="metric-sub">{subtitle}</div>}
    </div>
  );
}
