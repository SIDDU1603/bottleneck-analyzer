// Bottleneck scoring weights and tier mappings

export const RESOLUTION_WEIGHTS = {
  '1080p': { cpu: 1.3, gpu: 0.8, ram: 1.0 },
  '1440p': { cpu: 1.0, gpu: 1.0, ram: 1.0 },
  '4K':    { cpu: 0.7, gpu: 1.4, ram: 1.1 },
};

export const WORKLOAD_WEIGHTS = {
  gaming:     { cpu: 1.0, gpu: 1.2, ram: 0.9 },
  streaming:  { cpu: 1.3, gpu: 1.0, ram: 1.1 },
  rendering:  { cpu: 1.1, gpu: 1.1, ram: 1.2 },
  general:    { cpu: 1.0, gpu: 1.0, ram: 1.0 },
};

export const TIER_LABELS = {
  budget: 'Budget',
  midrange: 'Mid-Range',
  highend: 'High-End',
  enthusiast: 'Enthusiast',
};

export const TIER_COLORS = {
  budget: '#94a3b8',
  midrange: '#22d3ee',
  highend: '#a78bfa',
  enthusiast: '#f59e0b',
};

export const SEVERITY_CONFIG = {
  none:     { label: 'Balanced', color: '#22c55e', emoji: '✅' },
  minor:    { label: 'Minor Bottleneck', color: '#eab308', emoji: '⚡' },
  moderate: { label: 'Moderate Bottleneck', color: '#f97316', emoji: '⚠️' },
  severe:   { label: 'Severe Bottleneck', color: '#ef4444', emoji: '🔴' },
};

export const COMPONENT_TYPES = [
  { key: 'cpu', label: 'CPU', icon: '🧠' },
  { key: 'gpu', label: 'GPU', icon: '🎮' },
  { key: 'ram', label: 'RAM', icon: '💾' },
  { key: 'motherboard', label: 'Motherboard', icon: '🔧' },
  { key: 'psu', label: 'PSU', icon: '⚡' },
  { key: 'storage', label: 'Storage', icon: '💿' },
];

export const RESOLUTIONS = ['1080p', '1440p', '4K'];
export const WORKLOADS = ['gaming', 'streaming', 'rendering', 'general'];
