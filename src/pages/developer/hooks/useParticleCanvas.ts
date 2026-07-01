import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

interface UseParticleCanvasOptions {
  count?: number;
  maxDistance?: number;
  speed?: number;
  mouseInfluence?: boolean;
}

export function useParticleCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UseParticleCanvasOptions = {}
) {
  const {
    count = 45,          // reduced from 100
    maxDistance = 100,   // reduced from 140
    speed = 0.2,         // reduced from 0.25
    mouseInfluence = true,
  } = options;

  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const isActiveRef = useRef(true);
  const lastFrameRef = useRef(0);

  const initParticles = useCallback((width: number, height: number) => {
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed * 2,
      vy: (Math.random() - 0.5) * speed * 2,
      radius: Math.random() * 1.2 + 0.4,
      alpha: Math.random() * 0.4 + 0.15,
    }));
  }, [count, speed]);

  const draw = useCallback((timestamp: number) => {
    // Cap at ~40fps to save CPU
    if (timestamp - lastFrameRef.current < 25) {
      if (isActiveRef.current) rafRef.current = requestAnimationFrame(draw);
      return;
    }
    lastFrameRef.current = timestamp;

    const canvas = canvasRef.current;
    if (!canvas || !isActiveRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const particles = particlesRef.current;
    const mouse = mouseRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      if (mouseInfluence) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 8000) {
          const dist = Math.sqrt(dist2);
          p.vx -= (dx / dist) * 0.04;
          p.vy -= (dy / dist) * 0.04;
        }
      }

      p.vx *= 0.98;
      p.vy *= 0.98;

      const maxV = speed * 2.5;
      if (p.vx > maxV) p.vx = maxV;
      if (p.vx < -maxV) p.vx = -maxV;
      if (p.vy > maxV) p.vy = maxV;
      if (p.vy < -maxV) p.vy = -maxV;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#1DB954';
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      // Draw connections — only check forward particles to avoid double-work
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist2 = dx * dx + dy * dy;

        if (dist2 < maxDistance * maxDistance) {
          const alpha = (1 - Math.sqrt(dist2) / maxDistance) * 0.25;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = '#1DB954';
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    rafRef.current = requestAnimationFrame(draw);
  }, [maxDistance, speed, mouseInfluence]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles(canvas.width, canvas.height);
    };

    resize();
    isActiveRef.current = true;
    rafRef.current = requestAnimationFrame(draw);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    // Pause when tab is hidden
    const handleVisibility = () => {
      isActiveRef.current = !document.hidden;
      if (isActiveRef.current) rafRef.current = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (mouseInfluence) window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isActiveRef.current = false;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      if (mouseInfluence) window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [draw, initParticles, mouseInfluence]);
}
