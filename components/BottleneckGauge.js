'use client';
import { useBuild } from './BuildContext';
import { SEVERITY_CONFIG } from '@/lib/constants';

export default function BottleneckGauge({ result }) {
  if (!result) return null;
  const { bottleneckPercentage, bottleneckSeverity, overallScore } = result;
  const severity = SEVERITY_CONFIG[bottleneckSeverity] || SEVERITY_CONFIG.none;

  // Arc calculation (half circle)
  const radius = 90;
  const circumference = Math.PI * radius;
  const progress = (bottleneckPercentage / 100) * circumference;
  const offset = circumference - progress;

  return (
    <div className="gauge-container animate-in">
      <svg className="gauge-svg" viewBox="0 0 220 130">
        <path
          className="gauge-track"
          d="M 20 120 A 90 90 0 0 1 200 120"
        />
        <path
          className="gauge-fill"
          d="M 20 120 A 90 90 0 0 1 200 120"
          stroke={severity.color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="gauge-value" style={{ color: severity.color }}>
        {bottleneckPercentage}%
      </div>
      <div className="gauge-label">
        {severity.emoji} {severity.label}
      </div>
      <div style={{ marginTop: 12 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>System Score: </span>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{overallScore}/100</span>
      </div>
    </div>
  );
}
