'use client';

export default function CompatibilityList({ checks }) {
  if (!checks || checks.length === 0) return null;
  const icons = { pass: '✅', warn: '⚠️', fail: '❌' };

  return (
    <div className="compat-list">
      {checks.map((check, i) => (
        <div key={i} className={`compat-badge ${check.status}`}>
          <span className="compat-icon">{icons[check.status]}</span>
          <span>{check.message}</span>
        </div>
      ))}
    </div>
  );
}
