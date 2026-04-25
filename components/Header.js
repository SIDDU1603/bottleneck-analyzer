'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBuild } from './BuildContext';

export default function Header() {
  const pathname = usePathname();
  const { selectedCount } = useBuild();

  const links = [
    { href: '/', label: '🔧 Build', id: 'nav-build' },
    { href: '/analysis', label: '📊 Analysis', id: 'nav-analysis' },
    { href: '/builds', label: '💾 Saved Builds', id: 'nav-builds' },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo" id="logo-link">
          <span className="logo-icon">⚡</span>
          BottleneckIQ
        </Link>
        <nav className="nav">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              id={link.id}
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
              {link.href === '/' && selectedCount > 0 && (
                <span style={{ marginLeft: 6, color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>
                  ({selectedCount})
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
