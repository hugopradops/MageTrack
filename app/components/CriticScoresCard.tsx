'use client';

import { useState, useEffect } from 'react';
import { useItemsPerPage } from '@/lib/useItemsPerPage';

interface CriticGame {
  id: number;
  name: string;
  score: number;
  tier: string;
  releaseDate: string | null;
  platforms: string[];
  image: string | null;
  url: string;
}

function scoreClass(score: number) {
  if (score >= 90) return 'mc-universal';
  if (score >= 75) return 'mc-generally';
  if (score >= 50) return 'mc-mixed';
  return 'mc-unfavorable';
}

// [minViewportHeight, itemsPerPage]
// 1080p browser viewport ≈ 930px, 1440p ≈ 1300px
const REVIEW_BREAKPOINTS: [number, number][] = [
  [0, 3], // 1080p and below: 3 items
  [1100, 4], // 1200p–1439p: 4 items
  [1300, 5], // 1440p+: 5 items
];

export default function CriticScoresCard() {
  const [games, setGames] = useState<CriticGame[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(false);
  const gamesPerPage = useItemsPerPage(REVIEW_BREAKPOINTS, 3);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/metacritic');
        const data = await res.json();
        setGames(data.games || []);
      } catch {
        setError(true);
      }
    }
    load();
  }, []);

  return (
    <section className="card card-reviews" id="reviews-section">
      <div className="card-header">
        <div className="card-icon-wrap reviews-icon-wrap">
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
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <h2>Community Reviews</h2>
        {games && games.length > 0 && (
          <span className="card-badge" id="reviews-count">
            {games.length} games
          </span>
        )}
      </div>
      <div className="card-body" id="reviews-content">
        {error ? (
          <div className="error-msg">
            <span className="error-icon">⭐</span>Failed to load critic scores.
          </div>
        ) : games === null ? (
          <div className="skeleton-loader">
            <div className="skeleton skeleton-row"></div>
            <div className="skeleton skeleton-row"></div>
            <div className="skeleton skeleton-row"></div>
          </div>
        ) : (
          <>
            <div className="reviews-list">
              {(() => {
                const maxPage = Math.max(1, Math.ceil(games.length / gamesPerPage));
                const page = Math.min(currentPage, maxPage);
                return games.slice((page - 1) * gamesPerPage, page * gamesPerPage);
              })().map((g) => {
                const cls = scoreClass(g.score);
                const platforms = (g.platforms || []).join(' · ');
                return (
                  <a
                    key={g.id}
                    href={g.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`review-item ${cls}`}
                  >
                    <div className="review-thumb">
                      {g.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={g.image} alt={g.name} loading="lazy" />
                      ) : (
                        <div className="review-thumb-placeholder">?</div>
                      )}
                    </div>
                    <div className="review-info">
                      <h3>{g.name}</h3>
                      <div className="review-meta">
                        <span className="review-genres">{platforms}</span>
                      </div>
                    </div>
                    <div className="review-score-wrap">
                      <span className={`mc-score ${cls}`}>{g.score}%</span>
                      <span className="review-stats">{g.tier}</span>
                    </div>
                  </a>
                );
              })}
            </div>
            {games.length > gamesPerPage && (
              <div className="news-pagination">
                {Array.from(
                  { length: Math.ceil(games.length / gamesPerPage) },
                  (_, i) => i + 1,
                ).map((page) => (
                  <button
                    key={page}
                    className={`news-page-btn${page === currentPage ? ' active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
