'use client';

import { useState, useEffect } from 'react';
import MageLogo from './MageLogo';

export default function TopBar() {
  const [clock, setClock] = useState('');
  const [saleText, setSaleText] = useState('Loading...');
  const [releasesText, setReleasesText] = useState('Loading...');
  const [newsText, setNewsText] = useState('Loading...');

  // Live clock
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const date = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setClock(`${date} · ${time}`);
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Expose a way for child components to update stat pills
  useEffect(() => {
    const handler = (e: CustomEvent<{ key: string; value: string }>) => {
      const { key, value } = e.detail;
      if (key === 'sale') setSaleText(value);
      if (key === 'releases') setReleasesText(value);
      if (key === 'news') setNewsText(value);
    };
    window.addEventListener(
      'stat-update',
      handler as EventListener
    );
    return () =>
      window.removeEventListener(
        'stat-update',
        handler as EventListener
      );
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <MageLogo />
        <div className="topbar-brand">
          <h1 className="topbar-title">MageTrack</h1>
          <p className="topbar-subtitle">Your Handy PC Gaming Tool</p>
        </div>
      </div>
      <div className="topbar-center">
        <div className="stat-pill" id="stat-sale">
          <span className="stat-icon">🔥</span>
          <span className="stat-text" id="stat-sale-text">
            {saleText}
          </span>
        </div>
        <div className="stat-pill" id="stat-releases">
          <span className="stat-icon">🚀</span>
          <span className="stat-text" id="stat-releases-text">
            {releasesText}
          </span>
        </div>
        <div className="stat-pill" id="stat-news">
          <span className="stat-icon">📰</span>
          <span className="stat-text" id="stat-news-text">
            {newsText}
          </span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="hero-clock" id="hero-clock">
          {clock}
        </div>
      </div>
    </header>
  );
}
