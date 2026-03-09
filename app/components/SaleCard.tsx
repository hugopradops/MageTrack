'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

function timeUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { days: d, hours: h, minutes: m, seconds: s };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatDate(dateStr: string) {
  if (!dateStr || dateStr === 'TBA') return 'TBA';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

interface SaleData {
  next: { name: string; start: string; end: string } | null;
  active: boolean;
}

function dispatchStat(key: string, value: string) {
  window.dispatchEvent(
    new CustomEvent('stat-update', { detail: { key, value } })
  );
}

export default function SaleCard() {
  const [saleData, setSaleData] = useState<SaleData | null>(null);
  const [error, setError] = useState(false);
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback((targetDate: string) => {
    function tick() {
      setCountdown(timeUntil(targetDate));
    }
    tick();
    intervalRef.current = setInterval(tick, 1000);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/steam-sales');
        const data: SaleData = await res.json();
        setSaleData(data);

        if (data.next) {
          const targetDate = data.active ? data.next.end : data.next.start;
          startCountdown(targetDate);

          const t = timeUntil(data.next.start);
          if (data.active) {
            dispatchStat('sale', `${data.next.name} — LIVE!`);
          } else {
            dispatchStat(
              'sale',
              t ? `${data.next.name} in ${t.days}d` : data.next.name
            );
          }
        } else {
          dispatchStat('sale', 'No upcoming sales');
        }
      } catch {
        setError(true);
        dispatchStat('sale', 'Error loading');
      }
    }
    load();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startCountdown]);

  return (
    <section className="card card-sale" id="sale-section">
      <div className="card-header">
        <div className="card-icon-wrap sale-icon-wrap">
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
            <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
          </svg>
        </div>
        <h2>Next Steam Sale</h2>
      </div>
      <div className="card-body" id="sale-content">
        {error ? (
          <div className="error-msg">
            <span className="error-icon">⚡</span>Failed to load sale data.
          </div>
        ) : !saleData ? (
          <div className="skeleton-loader">
            <div className="skeleton skeleton-circle"></div>
            <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
            <div className="skeleton skeleton-boxes"></div>
          </div>
        ) : !saleData.next ? (
          <div className="error-msg">
            <span className="error-icon">🔮</span>No upcoming sales found.
          </div>
        ) : (
          <>
            {/* Sale visual SVG — rendered once, never re-rendered */}
            <div className="sale-visual">
              <svg
                viewBox="0 0 80 80"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="saleGrad1"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" style={{ stopColor: '#ff4939' }} />
                    <stop offset="100%" style={{ stopColor: '#d93a2d' }} />
                  </linearGradient>
                  <filter id="saleGlow">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  fill="none"
                  stroke="url(#saleGrad1)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  className="sale-ring"
                  filter="url(#saleGlow)"
                />
                <text
                  x="40"
                  y="46"
                  textAnchor="middle"
                  fontSize="24"
                  filter="url(#saleGlow)"
                >
                  🏷️
                </text>
              </svg>
            </div>

            <div className="sale-name">{saleData.next.name}</div>

            {saleData.active ? (
              <>
                <div className="sale-active-badge">
                  <span className="sale-active-dot"></span> LIVE NOW
                </div>
                <div className="sale-status">
                  Ends {formatDate(saleData.next.end)}
                </div>
              </>
            ) : (
              <div className="sale-status">
                Starts {formatDate(saleData.next.start)}
              </div>
            )}

            {/* Countdown — only this part updates every second */}
            <div id="sale-countdown-wrap">
              {countdown ? (
                <div className="countdown">
                  <div className="countdown-unit">
                    <div className="countdown-value">{countdown.days}</div>
                    <div className="countdown-label">Days</div>
                  </div>
                  <div className="countdown-unit">
                    <div className="countdown-value">
                      {pad(countdown.hours)}
                    </div>
                    <div className="countdown-label">Hours</div>
                  </div>
                  <div className="countdown-unit">
                    <div className="countdown-value">
                      {pad(countdown.minutes)}
                    </div>
                    <div className="countdown-label">Min</div>
                  </div>
                  <div className="countdown-unit">
                    <div className="countdown-value">
                      {pad(countdown.seconds)}
                    </div>
                    <div className="countdown-label">Sec</div>
                  </div>
                </div>
              ) : (
                <span className="sale-status">
                  Happening now or already passed!
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
