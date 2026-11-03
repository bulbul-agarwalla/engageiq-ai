/**
 * Formatting helpers for telemetry and analytics.
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatScore(score) {
  if (score === null || score === undefined) return '0%';
  return `${Number(score).toFixed(1)}%`;
}

export function getStateColor(state) {
  const norm = String(state || '').toLowerCase();
  switch (norm) {
    case 'engaged':
      return '#10b981'; // green
    case 'passive':
      return '#3b82f6'; // blue
    case 'confused':
      return '#f59e0b'; // amber
    case 'distracted':
      return '#ef4444'; // red
    case 'drowsy':
      return '#8b5cf6'; // purple
    default:
      return '#6b7280';
  }
}
