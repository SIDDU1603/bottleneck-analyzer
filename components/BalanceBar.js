'use client';

export default function BalanceBar({ result }) {
  if (!result || !result.componentScores) return null;
  const { componentScores, cpuGpuBalance } = result;

  // Normalize to 0-100 range for visual
  const total = componentScores.cpu + componentScores.gpu;
  const cpuPct = total > 0 ? (componentScores.cpu / total) * 100 : 50;

  const isBalanced = Math.abs(cpuGpuBalance) < 10;
  const cpuSide = cpuGpuBalance > 0;

  return (
    <div className="balance-container animate-in animate-delay-1">
      <div className="balance-labels">
        <span style={{ color: '#60a5fa' }}>🧠 CPU ({componentScores.cpu})</span>
        <span style={{ color: isBalanced ? 'var(--green)' : 'var(--yellow)', fontWeight: 600, fontSize: '0.75rem' }}>
          {isBalanced ? '✅ Balanced' : cpuSide ? '← CPU Dominant' : 'GPU Dominant →'}
        </span>
        <span style={{ color: '#c084fc' }}>🎮 GPU ({componentScores.gpu})</span>
      </div>
      <div className="balance-track">
        <div
          className="balance-fill"
          style={{
            left: 0,
            width: `${cpuPct}%`,
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          }}
        />
        <div className="balance-center" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <span>CPU Bottleneck</span>
        <span>GPU Bottleneck</span>
      </div>
    </div>
  );
}
