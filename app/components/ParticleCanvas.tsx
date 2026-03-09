'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  baseAlpha: number;
  color: number[];
  phase: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = [
      [255, 73, 57],
      [74, 158, 255],
      [107, 184, 255],
      [74, 222, 128],
    ];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    const count = Math.min(40, Math.floor(window.innerWidth / 30));
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.3,
        dx: (Math.random() - 0.5) * 0.15,
        dy: (Math.random() - 0.5) * 0.15,
        baseAlpha: Math.random() * 0.3 + 0.05,
        color,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let animId: number;

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      const t = Date.now() * 0.001;
      for (const p of particles) {
        const flicker = 0.5 + 0.5 * Math.sin(t * 0.6 + p.phase);
        const a = p.baseAlpha * (0.3 + 0.7 * flicker);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${a})`;
        ctx!.shadowBlur = p.r * 4;
        ctx!.shadowColor = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${a * 0.5})`;
        ctx!.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < -10) p.x = canvas!.width + 10;
        if (p.x > canvas!.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas!.height + 10;
        if (p.y > canvas!.height + 10) p.y = -10;
      }
      ctx!.shadowBlur = 0;
      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="particles-canvas" />;
}
