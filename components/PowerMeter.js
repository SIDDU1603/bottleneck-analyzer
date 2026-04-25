'use client';

export default function PowerMeter({ build, result }) {
  const psuWattage = build.psu?.specs?.wattage || 0;
  const powerDraw = result?.powerDraw || 0;
  
  if (!psuWattage && !powerDraw) return null;

  const percentage = psuWattage > 0 ? Math.min(100, Math.round((powerDraw / psuWattage) * 100)) : 0;
  const color = percentage > 90 ? 'var(--red)' : percentage > 75 ? 'var(--orange)' : percentage > 60 ? 'var(--yellow)' : 'var(--green)';

  return (
    <div className="power-meter animate-in animate-delay-2">
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
        ⚡ Power Consumption
      </div>
      <div className="power-bar-track">
        <div
          className="power-bar-fill"
          style={{ width: `${percentage}%`, background: color }}
        >
          {percentage > 15 && `${percentage}%`}
        </div>
      </div>
      <div className="power-info">
        <span>Estimated Draw: <strong>{powerDraw}W</strong></span>
        {psuWattage > 0 && <span>PSU Capacity: <strong>{psuWattage}W</strong></span>}
        {result?.recommendedPSU && <span>Recommended: <strong>{result.recommendedPSU}W+</strong></span>}
      </div>
    </div>
  );
}
