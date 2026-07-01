import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from './components/GlassPanel';

const VisualizerCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const isVisibleRef = useRef(false);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    resize();

    const bars = 48; // reduced from 80
    const draw = (timestamp: number) => {
      raf = requestAnimationFrame(draw);
      // Throttle to ~40fps
      if (timestamp - lastFrameRef.current < 25) return;
      lastFrameRef.current = timestamp;
      // Pause when off-screen
      if (!isVisibleRef.current) return;

      timeRef.current += 0.02;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const scale = window.devicePixelRatio;
      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(cx, cy) * 0.4;

      ctx.clearRect(0, 0, w, h);
      // Apply scale once
      ctx.save();
      ctx.scale(1, 1); // already in device pixels

      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
        const barH = baseR * (0.25 + Math.sin(t * 1.8 + i * 0.22) * 0.14 + Math.sin(t * 3.2 + i * 0.11) * 0.18);
        const x1 = cx + Math.cos(angle) * baseR;
        const y1 = cy + Math.sin(angle) * baseR;
        const x2 = cx + Math.cos(angle) * (baseR + barH);
        const y2 = cy + Math.sin(angle) * (baseR + barH);

        const hue = 130 + (i / bars) * 60 + t * 8;
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `hsla(${hue},85%,50%,0.85)`);
        grad.addColorStop(1, `hsla(${hue + 25},85%,65%,0)`);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = (w / bars) * 0.55;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Center glow (single gradient, no per-bar overhead)
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 0.55);
      grd.addColorStop(0, 'rgba(29,185,84,0.28)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    };

    raf = requestAnimationFrame(draw);

    // Pause when not visible
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(canvas);


    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, []);


  return <canvas ref={canvasRef} className="w-full h-64" />;
};

const AIFeatureCard: React.FC<{ title: string; desc: string; icon: string; color: string; delay: number }> = ({ title, desc, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
  >
    <GlassPanel className="p-6 h-full" glowColor={`${color}20`}>
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="font-mono font-bold text-sm mb-2" style={{ color }}>{title}</h3>
      <p className="font-mono text-xs text-brand-textMuted leading-relaxed">{desc}</p>
    </GlassPanel>
  </motion.div>
);

export const AIFeatures: React.FC = () => {
  const features = [
    { title: 'Mood Detection', icon: '🎭', color: '#c678dd', desc: 'Extracts dominant palette from album art using Palette API, maps colors to mood profiles, adjusts EQ and queue dynamically.', delay: 0 },
    { title: 'Smart Shuffle', icon: '🧠', color: '#1DB954', desc: 'Decision tree trained on skip rate, completion rate, time-of-day, and listening history to predict next track preference.', delay: 0.1 },
    { title: 'Auto-Queue', icon: '⚡', color: '#e5c07b', desc: 'Continuously predicts upcoming tracks using collaborative filtering across similar listener profiles from anonymized data.', delay: 0.2 },
    { title: 'Lyrics Sync', icon: '🎵', color: '#61afef', desc: 'Word-level timestamp alignment using FFT cross-correlation with reference audio segments for sub-100ms accuracy.', delay: 0.3 },
    { title: 'Genre Classifier', icon: '📊', color: '#e06c75', desc: 'On-device ONNX model classifies audio fingerprints into 42 micro-genres without sending audio to the server.', delay: 0.4 },
    { title: 'Discover Engine', icon: '✦', color: '#98c379', desc: 'Matrix factorization with user embedding vectors identifies latent taste dimensions for serendipitous discovery.', delay: 0.5 },
  ];

  return (
    <section className="relative py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="scene-badge mb-4 block">Scene 14</span>
          <h2 className="font-sans font-black text-3xl md:text-4xl text-white mb-3">
            AI <span className="text-white">Intelligence</span>
          </h2>
          <p className="font-mono text-brand-textMuted text-sm">On-device ML · Collaborative filtering · Mood detection · Smart queuing</p>
        </div>

        {/* Visualizer as AI "brain" */}
        <GlassPanel className="mb-10 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <span className="font-mono text-xs text-brand-textMuted uppercase tracking-widest">AI Audio Fingerprint Analyzer</span>
          </div>
          <VisualizerCanvas />
        </GlassPanel>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <AIFeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
};
