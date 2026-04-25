'use client';
import { useState, useEffect } from 'react';
import { useBuild } from './BuildContext';
import { COMPONENT_TYPES } from '@/lib/constants';

export default function ComponentSelector() {
  const { build, updateComponent } = useBuild();
  const [components, setComponents] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/components')
      .then(r => r.json())
      .then(data => { setComponents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <div className="loading-text">Loading components...</div>
      </div>
    );
  }

  return (
    <div className="selector-grid">
      {COMPONENT_TYPES.map(({ key, label, icon }) => {
        const options = components[key] || [];
        const selected = build[key];
        return (
          <div key={key} className="selector-item animate-in">
            <div className="selector-label">
              <span>{icon}</span> {label}
            </div>
            <select
              id={`select-${key}`}
              className="selector-dropdown"
              value={selected?.id || ''}
              onChange={(e) => {
                const comp = options.find(c => c.id === e.target.value);
                updateComponent(key, comp || null);
              }}
            >
              <option value="">— Select {label} —</option>
              {options.map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.name} — ${comp.price}
                </option>
              ))}
            </select>
            {selected && (
              <div className="selected-info">
                <span>Score: <span className="score">{selected.benchmarkScore}/100</span></span>
                <span className="price">${selected.price}</span>
                {selected.tdp > 0 && <span>{selected.tdp}W</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
