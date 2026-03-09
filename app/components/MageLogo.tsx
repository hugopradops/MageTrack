export default function MageLogo() {
  return (
    <div className="mage-logo" aria-label="Mage Logo">
      <svg
        viewBox="0 0 120 120"
        className="mage-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#4a9eff' }} />
            <stop offset="100%" style={{ stopColor: '#3580d9' }} />
          </linearGradient>
          <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ffe0bd' }} />
            <stop offset="100%" style={{ stopColor: '#f5cea0' }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polygon points="60,8 38,58 82,58" fill="url(#hatGrad)" />
        <ellipse cx="60" cy="58" rx="32" ry="6" fill="url(#hatGrad)" />
        <text
          x="55"
          y="38"
          fontSize="14"
          fill="#ff4939"
          filter="url(#glow)"
          className="hat-star"
        >
          ✦
        </text>
        <circle
          cx="60"
          cy="12"
          r="4"
          fill="#ff4939"
          filter="url(#glow)"
          className="hat-orb"
        />
        <ellipse cx="60" cy="72" rx="18" ry="16" fill="url(#faceGrad)" />
        <circle cx="53" cy="70" r="2.5" fill="#1a1a2e" className="eye-left" />
        <circle cx="67" cy="70" r="2.5" fill="#1a1a2e" className="eye-right" />
        <circle cx="54" cy="69" r="1" fill="white" opacity="0.8" />
        <circle cx="68" cy="69" r="1" fill="white" opacity="0.8" />
        <polygon points="48,82 60,105 72,82" fill="#c8ccd8" opacity="0.9" />
        <polygon points="52,82 60,98 68,82" fill="#dde0ea" opacity="0.5" />
      </svg>
    </div>
  );
}
