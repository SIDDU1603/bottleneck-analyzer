'use client';
import { useState } from 'react';
import { useBuild } from '@/components/BuildContext';
import ComponentSelector from '@/components/ComponentSelector';
import { useRouter } from 'next/navigation';
import { RESOLUTIONS, WORKLOADS } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  const {
    build, clearBuild, runAnalysis, isAnalyzing,
    resolution, setResolution, workload, setWorkload,
    totalPrice, selectedCount,
  } = useBuild();

  const [saveName, setSaveName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const canAnalyze = build.cpu && build.gpu;

  const handleAnalyze = async () => {
    const result = await runAnalysis();
    if (result) router.push('/analysis');
  };

  const handleSave = async () => {
    if (!saveName.trim()) return;
    try {
      const builds = JSON.parse(localStorage.getItem('bottleneck-analyzer-builds') || '[]');
      builds.push({
        id: `local-${Date.now()}`,
        name: saveName.trim(),
        components: build,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('bottleneck-analyzer-builds', JSON.stringify(builds));
      setSaveStatus('Build saved!');
      setTimeout(() => { setShowSaveModal(false); setSaveStatus(''); setSaveName(''); }, 1200);
    } catch { setSaveStatus('Failed to save'); }
  };

  return (
    <div className="container">
      <h1 className="page-title">Build Your PC</h1>
      <p className="page-subtitle">Select components to analyze for bottlenecks and compatibility</p>

      {/* Settings Bar */}
      <div className="settings-bar">
        <div className="setting-group">
          <span className="setting-label">Resolution</span>
          <div className="setting-options">
            {RESOLUTIONS.map(r => (
              <button key={r} id={`res-${r}`} className={`setting-option ${resolution === r ? 'active' : ''}`} onClick={() => setResolution(r)}>{r}</button>
            ))}
          </div>
        </div>
        <div className="setting-group">
          <span className="setting-label">Workload</span>
          <div className="setting-options">
            {WORKLOADS.map(w => (
              <button key={w} id={`workload-${w}`} className={`setting-option ${workload === w ? 'active' : ''}`} onClick={() => setWorkload(w)}>
                {w.charAt(0).toUpperCase() + w.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Component Selector */}
      <ComponentSelector />

      {/* Bottom Bar */}
      {selectedCount > 0 && (
        <div className="total-bar animate-in">
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedCount} components selected</span>
          </div>
          <div className="total-price">${totalPrice.toLocaleString()}</div>
          <div className="btn-group">
            <button className="btn btn-secondary btn-sm" onClick={() => setShowSaveModal(true)} id="save-build-btn">
              💾 Save Build
            </button>
            <button className="btn btn-secondary btn-sm" onClick={clearBuild} id="clear-build-btn">
              🗑️ Clear
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAnalyze}
              disabled={!canAnalyze || isAnalyzing}
              id="analyze-btn"
            >
              {isAnalyzing ? (
                <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Analyzing...</>
              ) : (
                '🔍 Analyze Build'
              )}
            </button>
          </div>
        </div>
      )}

      {!canAnalyze && selectedCount > 0 && (
        <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--yellow)', fontSize: '0.85rem' }}>
          ⚠️ Select at least a CPU and GPU to run analysis
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">💾 Save Build</div>
            <input
              className="modal-input"
              placeholder="Enter build name..."
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
              id="save-name-input"
            />
            {saveStatus && <div style={{ marginBottom: '1rem', color: 'var(--green)', fontSize: '0.85rem' }}>{saveStatus}</div>}
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowSaveModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} id="confirm-save-btn">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
