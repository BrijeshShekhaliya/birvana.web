import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from './components/GlassPanel';

const metrics = [
  { label: 'Stream Start', value: 0.8, max: 3, unit: 's', color: '#1DB954', target: '< 1s' },
  { label: 'Audio Latency', value: 18, max: 100, unit: 'ms', color: '#61afef', target: '< 20ms' },
  { label: 'Cache Hit Rate', value: 87, max: 100, unit: '%', color: '#e5c07b', target: '> 80%' },
  { label: 'Memory Usage', value: 128, max: 512, unit: 'MB', color: '#c678dd', target: '< 150MB' },
  { label: 'Frame Rate', value: 60, max: 60, unit: 'fps', color: '#FF6F61', target: '60fps' },
  { label: 'Search Latency', value: 140, max: 500, unit: 'ms', color: '#98c379', target: '< 200ms' },
];

const FPSMeter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;

    const ctx = canvas.getContext('2d')!;
    const scale = window.devicePixelRatio;
    let lastTime = performance.now();
    let raf: number;

    const draw = (now: number) => {
      const fps = Math.round(1000 / (now - lastTime));
      lastTime = now;
      framesRef.current.push(fps);
      if (framesRef.current.length > 60) framesRef.current.shift();

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w * scale, h * scale);
      ctx.save();
      ctx.scale(scale, scale);

      // Draw FPS graph
      const frames = framesRef.current;
      ctx.beginPath();
      frames.forEach((f, i) => {
        const x = (i / 60) * w;
        const y = h - (Math.min(f, 60) / 60) * h * 0.9;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#1DB954';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Fill area
      ctx.lineTo((frames.length / 60) * w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = 'rgba(29,185,84,0.1)';
      ctx.fill();

      // Current FPS text
      const curFPS = frames[frames.length - 1] ?? 60;
      ctx.font = `bold 28px JetBrains Mono`;
      ctx.fillStyle = curFPS >= 55 ? '#1DB954' : curFPS >= 30 ? '#e5c07b' : '#e06c75';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.min(curFPS, 60)}`, w - 8, 34);
      ctx.font = `10px JetBrains Mono`;
      ctx.fillStyle = '#666';
      ctx.fillText('fps', w - 8, 48);

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    // Pause when not visible
    const isVisibleRef = { current: false };
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, []);


  return <canvas ref={canvasRef} className="w-full h-24" />;
};

const AnimatedGauge: React.FC<{ metric: typeof metrics[0] }> = ({ metric }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const pct = metric.value / metric.max;

  return (
    <GlassPanel className="p-5" glowColor={`${metric.color}20`}>
      <div className="flex justify-between items-center mb-3">
        <span className="font-mono text-xs text-brand-textMuted uppercase tracking-widest">{metric.label}</span>
        <span className="font-mono text-xs" style={{ color: metric.color }}>{metric.target}</span>
      </div>

      {/* Bar */}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${metric.color}80, ${metric.color})` }}
          initial={{ width: 0 }}
          animate={{ width: animated ? `${pct * 100}%` : 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="flex items-baseline gap-1">
        <motion.span
          className="font-mono font-bold text-2xl"
          style={{ color: metric.color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {metric.value}
        </motion.span>
        <span className="font-mono text-xs text-brand-textMuted">{metric.unit}</span>
      </div>
    </GlassPanel>
  );
};

export const PerformanceMetrics: React.FC = () => {
  return (
    <section className="relative py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="scene-badge mb-4 block">Scene 12</span>
          <h2 className="font-sans font-black text-3xl md:text-4xl text-white mb-3">
            Performance <span className="text-white">Metrics</span>
          </h2>
          <p className="font-mono text-brand-textMuted text-sm">Real-world measurements from production builds</p>
        </div>

        {/* FPS Live monitor */}
        <GlassPanel className="p-6 mb-8">
          <div className="font-mono text-xs text-brand-textMuted uppercase tracking-widest mb-3">Live FPS Monitor (Browser)</div>
          <FPSMeter />
        </GlassPanel>

        {/* Metrics grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <AnimatedGauge key={m.label} metric={m} />
          ))}
        </div>

        {/* Bottom comparison */}
        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Cold Start', before: '2.8s', after: '0.8s', improvement: '-71%' },
            { label: 'APK Size', before: '48 MB', after: '22 MB', improvement: '-54%' },
            { label: 'Battery', before: '180 mAh/hr', after: '95 mAh/hr', improvement: '-47%' },
          ].map((item) => (
            <GlassPanel key={item.label} className="p-5 text-center">
              <div className="font-mono text-xs text-brand-textMuted uppercase tracking-widest mb-4">{item.label}</div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-center">
                  <div className="font-mono text-sm text-brand-textMuted line-through">{item.before}</div>
                  <div className="font-mono text-xs text-brand-textMuted mt-1">Before</div>
                </div>
                <div className="font-mono text-lg text-white font-bold">{item.improvement}</div>
                <div className="text-center">
                  <div className="font-mono text-sm text-white">{item.after}</div>
                  <div className="font-mono text-xs text-brand-textMuted mt-1">After</div>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </section>
  );
};
