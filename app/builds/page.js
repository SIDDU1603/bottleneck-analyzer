'use client';
import { useState, useEffect } from 'react';
import { useBuild } from '@/components/BuildContext';
import { useRouter } from 'next/navigation';

export default function BuildsPage() {
  const router = useRouter();
  const { loadBuild } = useBuild();
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('bottleneck-analyzer-builds') || '[]');
    setBuilds(saved);
    setLoading(false);
  }, []);

  const handleLoad = (b) => {
    loadBuild(b);
    router.push('/');
  };

  const handleDelete = (id) => {
    const updated = builds.filter(b => b.id !== id);
    setBuilds(updated);
    localStorage.setItem('bottleneck-analyzer-builds', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container"><div className="spinner" /><div className="loading-text">Loading builds...</div></div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">Saved Builds</h1>
      <p className="page-subtitle">Load a previous build to analyze or modify</p>

      {builds.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💾</div>
          <div className="empty-state-title">No Saved Builds</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Create a build and save it to see it here
          </p>
          <button className="btn btn-primary" onClick={() => router.push('/')} id="create-build-btn">
            🔧 Create Build
          </button>
        </div>
      ) : (
        <div className="builds-grid">
          {builds.map((b, i) => {
            const comps = b.components || {};
            return (
              <div key={b.id || i} className="build-card animate-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="build-card-name">{b.name || 'Untitled Build'}</div>
                <div className="build-card-date">
                  {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="build-card-specs">
                  {comps.cpu && <div className="build-card-spec"><span className="label">🧠 CPU</span><span className="value">{comps.cpu.name}</span></div>}
                  {comps.gpu && <div className="build-card-spec"><span className="label">🎮 GPU</span><span className="value">{comps.gpu.name}</span></div>}
                  {comps.ram && <div className="build-card-spec"><span className="label">💾 RAM</span><span className="value">{comps.ram.name}</span></div>}
                  {comps.motherboard && <div className="build-card-spec"><span className="label">🔧 Board</span><span className="value">{comps.motherboard.name}</span></div>}
                  {comps.psu && <div className="build-card-spec"><span className="label">⚡ PSU</span><span className="value">{comps.psu.name}</span></div>}
                  {comps.storage && <div className="build-card-spec"><span className="label">💿 Storage</span><span className="value">{comps.storage.name}</span></div>}
                </div>
                <div className="build-card-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleLoad(b)} id={`load-build-${i}`}>
                    📂 Load
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)} id={`delete-build-${i}`}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
