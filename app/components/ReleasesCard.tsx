'use client';

import { useState, useEffect } from 'react';

interface Game {
  name: string;
  released: string | null;
  comingSoon: boolean;
  image: string | null;
  platforms: string[];
  genres: string[];
  description: string;
  appid: string;
}

function relativeTime(dateStr: string | null) {
  if (!dateStr || dateStr === 'TBA') return '';
  const release = new Date(dateStr);
  if (isNaN(release.getTime())) return '';
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const releaseMid = new Date(
    release.getFullYear(),
    release.getMonth(),
    release.getDate(),
  );
  const days = Math.round((releaseMid.getTime() - todayMid.getTime()) / 86400000);
  if (days < 0) return 'Released';
  if (days === 0) return 'Today!';
  if (days === 1) return 'Tomorrow!';
  if (days < 7) return `${days} days away`;
  if (days < 30) return `${Math.ceil(days / 7)} weeks away`;
  const months = Math.floor(days / 30);
  return `~${months} month${months > 1 ? 's' : ''} away`;
}

function stringToColor(str: string): [string, string] {
  const colors: [string, string][] = [
    ['rgba(167, 139, 250, 0.15)', 'rgba(124, 58, 237, 0.08)'],
    ['rgba(255, 179, 71, 0.15)', 'rgba(200, 135, 58, 0.08)'],
    ['rgba(103, 232, 249, 0.15)', 'rgba(6, 182, 212, 0.08)'],
    ['rgba(52, 211, 153, 0.15)', 'rgba(5, 150, 105, 0.08)'],
    ['rgba(248, 113, 113, 0.12)', 'rgba(220, 38, 38, 0.06)'],
    ['rgba(251, 191, 36, 0.12)', 'rgba(217, 119, 6, 0.06)'],
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getPlatformIcons(platforms: string[]) {
  if (!platforms || platforms.length === 0) return null;
  const icons: string[] = [];
  const joined = platforms.join(' ').toLowerCase();
  if (joined.includes('pc') || joined.includes('windows')) icons.push('PC');
  if (joined.includes('playstation')) icons.push('PS');
  if (joined.includes('xbox')) icons.push('XB');
  if (joined.includes('switch') || joined.includes('nintendo')) icons.push('NS');
  if (icons.length === 0) return null;
  return (
    <div className="release-platform-tag">
      {icons.map((icon) => (
        <span key={icon} className="platform-icon">
          {icon}
        </span>
      ))}
    </div>
  );
}

function dispatchStat(key: string, value: string) {
  window.dispatchEvent(new CustomEvent('stat-update', { detail: { key, value } }));
}

export default function ReleasesCard() {
  const [games, setGames] = useState<Game[] | null>(null);
  const [error, setError] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/releases');
        const data = await res.json();
        if (!data.games || data.games.length === 0) {
          setGames([]);
          dispatchStat('releases', 'No releases');
        } else {
          setGames(data.games);
          dispatchStat('releases', `${data.games.length} upcoming releases`);
        }
      } catch {
        setError(true);
        dispatchStat('releases', 'Error loading');
      }
    }
    load();
  }, []);

  return (
    <section className="card card-releases" id="releases-section">
      <div className="card-header">
        <div className="card-icon-wrap releases-icon-wrap">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 3v12" />
            <path d="M18 9a3 3 0 100-6 3 3 0 000 6z" />
            <path d="M6 21a3 3 0 100-6 3 3 0 000 6z" />
            <path d="M18 9c-3 0-6 2-6 6" />
          </svg>
        </div>
        <h2>Upcoming Releases</h2>
        {games && games.length > 0 && (
          <span className="card-badge" id="release-count">
            {games.length} titles
          </span>
        )}
      </div>
      <div className="card-body card-body-scroll" id="releases-content">
        {error ? (
          <div className="error-msg" role="alert">
            <svg
              className="error-icon-svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
              <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
            </svg>
            Failed to load releases.
          </div>
        ) : games === null ? (
          <div className="skeleton-loader skeleton-grid">
            <div className="skeleton skeleton-card-lg"></div>
            <div className="skeleton skeleton-card-lg"></div>
            <div className="skeleton skeleton-card-lg"></div>
            <div className="skeleton skeleton-card-lg"></div>
          </div>
        ) : games.length === 0 ? (
          <div className="error-msg">
            <svg
              className="error-icon-svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 12h4" />
              <path d="M14 12h.01" />
              <path d="M18 12h.01" />
            </svg>
            No upcoming releases found.
          </div>
        ) : (
          <div className="releases-grid">
            {games.map((g) => {
              const [c1, c2] = stringToColor(g.name);
              return (
                <a
                  key={g.appid}
                  href={`https://store.steampowered.com/app/${g.appid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="release-card"
                >
                  <div className="release-img-wrap">
                    {g.image && !imgErrors.has(g.appid) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        className="release-img"
                        src={g.image}
                        alt={g.name}
                        loading="lazy"
                        onError={() => setImgErrors((prev) => new Set(prev).add(g.appid))}
                      />
                    ) : (
                      <div
                        className="release-img-placeholder"
                        style={{
                          background: `linear-gradient(135deg, ${c1}, ${c2})`,
                        }}
                      >
                        <span>{g.name.charAt(0)}</span>
                      </div>
                    )}
                    {getPlatformIcons(g.platforms)}
                  </div>
                  <div className="release-info">
                    <h3>{g.name}</h3>
                    <div className="release-date">{g.released || 'Coming Soon'}</div>
                    <div className="release-countdown">{relativeTime(g.released)}</div>
                    {g.genres && g.genres.length > 0 && (
                      <div className="release-genres">{g.genres.join(' · ')}</div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
