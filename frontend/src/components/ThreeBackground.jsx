import { useEffect, useRef } from 'react';
import { useThemeStore } from '../store';

export default function ThreeBackground() {
  const canvasRef = useRef(null);
  const { theme } = useThemeStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let frameId;
    let t = 0;

    const isDark = theme === 'dark';

    const COLORS_DARK = ['#f43f5e', '#ec4899', '#d4a843', '#a78bfa', '#fb7185', '#f0c060'];
    const COLORS_LIGHT = ['#f43f5eaa', '#ec4899aa', '#d4a84388', '#c084fc88', '#fb923c88', '#6366f188'];
    const palette = isDark ? COLORS_DARK : COLORS_LIGHT;

    // Particles
    const COUNT = 120;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2.2 + 0.6,
      color: palette[Math.floor(Math.random() * palette.length)],
      phase: Math.random() * Math.PI * 2,
    }));

    // Rings (drawn as arcs)
    const rings = [
      { cx: width * 0.25, cy: height * 0.35, r: 140, rot: 0, rotSpeed: 0.003, color: isDark ? 'rgba(244,63,94,0.12)' : 'rgba(244,63,94,0.07)', lineW: 1.5, dash: [18, 12] },
      { cx: width * 0.75, cy: height * 0.65, r: 200, rot: 1.2, rotSpeed: -0.002, color: isDark ? 'rgba(212,168,67,0.10)' : 'rgba(212,168,67,0.07)', lineW: 1, dash: [30, 20] },
      { cx: width * 0.5,  cy: height * 0.5,  r: 260, rot: 0.5, rotSpeed: 0.0015, color: isDark ? 'rgba(167,139,250,0.09)' : 'rgba(99,102,241,0.06)', lineW: 1, dash: [10, 40] },
      { cx: width * 0.15, cy: height * 0.75, r: 100, rot: 2.0, rotSpeed: 0.004, color: isDark ? 'rgba(236,72,153,0.11)' : 'rgba(236,72,153,0.07)', lineW: 1.2, dash: [6, 14] },
    ];

    // Connection lines between nearby particles
    const drawConnections = () => {
      const maxDist = 100;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isDark ? 0.25 : 0.12);
            ctx.beginPath();
            ctx.strokeStyle = isDark ? `rgba(244,63,94,${alpha})` : `rgba(244,63,94,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.01;

      ctx.clearRect(0, 0, width, height);

      // Draw rings
      rings.forEach((ring) => {
        ring.rot += ring.rotSpeed;
        ctx.save();
        ctx.translate(ring.cx, ring.cy);
        ctx.rotate(ring.rot);
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = ring.lineW;
        ctx.setLineDash(ring.dash);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      });

      // Draw connections
      drawConnections();

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy + Math.sin(t + p.phase) * 0.12;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        const pulse = p.r + Math.sin(t * 1.5 + p.phase) * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulse * p.z, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Glow
        if (isDark) {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulse * p.z * 4);
          grd.addColorStop(0, p.color + '55');
          grd.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulse * p.z * 4, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }
      });
    };

    animate();

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      rings[0].cx = width * 0.25; rings[0].cy = height * 0.35;
      rings[1].cx = width * 0.75; rings[1].cy = height * 0.65;
      rings[2].cx = width * 0.5;  rings[2].cy = height * 0.5;
      rings[3].cx = width * 0.15; rings[3].cy = height * 0.75;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 1,
      }}
    />
  );
}
