'use client';
import { useBuild } from '@/components/BuildContext';
import BottleneckGauge from '@/components/BottleneckGauge';
import BalanceBar from '@/components/BalanceBar';
import PowerMeter from '@/components/PowerMeter';
import CompatibilityList from '@/components/CompatibilityList';
import { useRouter } from 'next/navigation';
import { RESOLUTIONS, WORKLOADS } from '@/lib/constants';

export default function AnalysisPage() {
  const router = useRouter();
  const {
    build, analysisResult, runAnalysis, isAnalyzing,
    resolution, setResolution, workload, setWorkload,
  } = useBuild();

  if (!analysisResult && !isAnalyzing) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">No Analysis Yet</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Select components and run an analysis from the Build page
          </p>
          <button className="btn btn-primary" onClick={() => router.push('/')} id="go-build-btn">
            🔧 Go to Build
          </button>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner" />
          <div className="loading-text">Analyzing your build with AI...</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>This may take a few seconds</div>
        </div>
      </div>
    );
  }

  const r = analysisResult;
  const ai = r.aiAnalysis;

  return (
    <div className="container">
      <h1 className="page-title">Analysis Results</h1>
      <p className="page-subtitle">
        {build.cpu?.name} + {build.gpu?.name} at {r.resolution} {r.workload}
      </p>

      {/* Resolution/Workload switcher */}
      <div className="settings-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="setting-group">
          <span className="setting-label">Resolution</span>
          <div className="setting-options">
            {RESOLUTIONS.map(res => (
              <button key={res} className={`setting-option ${resolution === res ? 'active' : ''}`}
                onClick={() => { setResolution(res); setTimeout(runAnalysis, 100); }}>{res}</button>
            ))}
          </div>
        </div>
        <div className="setting-group">
          <span className="setting-label">Workload</span>
          <div className="setting-options">
            {WORKLOADS.map(w => (
              <button key={w} className={`setting-option ${workload === w ? 'active' : ''}`}
                onClick={() => { setWorkload(w); setTimeout(runAnalysis, 100); }}>
                {w.charAt(0).toUpperCase() + w.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Column */}
        <div>
          {/* Bottleneck Gauge */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🎯 Bottleneck Analysis</span>
              <span className="card-badge" style={{ background: `${getColor(r.bottleneckSeverity)}22`, color: getColor(r.bottleneckSeverity) }}>
                {r.bottleneckSeverity}
              </span>
            </div>
            <BottleneckGauge result={r} />
            <BalanceBar result={r} />
          </div>

          {/* Component Scores */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-header">
              <span className="card-title">📊 Component Scores</span>
            </div>
            <div className="score-chips">
              <div className="score-chip">
                <span className="score-chip-value" style={{ color: '#60a5fa' }}>{r.componentScores?.cpu || 0}</span>
                <span className="score-chip-label">CPU</span>
              </div>
              <div className="score-chip">
                <span className="score-chip-value" style={{ color: '#c084fc' }}>{r.componentScores?.gpu || 0}</span>
                <span className="score-chip-label">GPU</span>
              </div>
              <div className="score-chip">
                <span className="score-chip-value" style={{ color: '#34d399' }}>{r.componentScores?.ram || 0}</span>
                <span className="score-chip-label">RAM</span>
              </div>
            </div>
            <PowerMeter build={build} result={r} />
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* AI Analysis */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🤖 AI Analysis</span>
              <span className="card-badge" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>Gemini</span>
            </div>
            <div className="analysis-section">
              <h3>💡 Summary</h3>
              <p className="analysis-text">{ai?.explanation || r.details}</p>
            </div>
            {ai?.technicalDetail && (
              <div className="analysis-section">
                <h3>🔬 Technical Detail</h3>
                <div className="technical-detail">{ai.technicalDetail}</div>
              </div>
            )}
          </div>

          {/* Compatibility */}
          {r.compatibility && r.compatibility.length > 0 && (
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <div className="card-header">
                <span className="card-title">🔗 Compatibility</span>
              </div>
              <CompatibilityList checks={r.compatibility} />
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Suggestions */}
      {ai?.suggestions && ai.suggestions.length > 0 && (
        <div style={{ marginTop: '2rem' }} className="animate-in animate-delay-2">
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
            🚀 Upgrade Suggestions
          </h2>
          <div className="upgrade-grid">
            {ai.suggestions.map((s, i) => (
              <div key={i} className="upgrade-card">
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                  {s.component}
                </div>
                <div className="upgrade-arrow">
                  <span className="upgrade-current">{s.current}</span>
                  <span className="upgrade-arrow-icon">→</span>
                  <span className="upgrade-recommended">{s.recommended}</span>
                </div>
                <div className="upgrade-reason">{s.reason}</div>
                <div className="upgrade-meta">
                  <span className="upgrade-improvement">↑ {s.estimatedImprovement}</span>
                  {s.estimatedCost > 0 && <span className="upgrade-cost">~${s.estimatedCost}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem', paddingBottom: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => router.push('/')} id="back-to-build-btn">
          🔧 Modify Build
        </button>
        <button className="btn btn-primary" onClick={runAnalysis} disabled={isAnalyzing} id="reanalyze-btn">
          🔄 Re-analyze
        </button>
      </div>
    </div>
  );
}

function getColor(severity) {
  const map = { none: '#22c55e', minor: '#eab308', moderate: '#f97316', severe: '#ef4444' };
  return map[severity] || '#94a3b8';
}
