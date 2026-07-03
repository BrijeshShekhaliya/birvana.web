import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from './components/GlassPanel';

// EQ bars using pure CSS — no JS animation loop
const EQBars: React.FC = () => {
  const barCount = 20;
  return (
    <div className="flex items-end justify-center gap-[5px] h-28 mt-4">
      {Array.from({ length: barCount }).map((_, i) => {
        const hue = 120 + i * 6;
        const baseH = 20 + Math.sin(i * 0.6) * 22 + (i % 3) * 10;
        const dur   = (0.5 + (i % 5) * 0.15).toFixed(2);
        const delay = (i * 0.06).toFixed(2);
        return (
          <div
            key={i}
            className="rounded-sm w-2.5 wave-bar"
            style={{
              height: `${baseH}%`,
              background: `hsl(${hue},72%,50%)`,
              '--duration': `${dur}s`,
              '--delay': `-${delay}s`,
              '--scale': String(1.6 + (i % 4) * 0.4),
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
};

/**
 * WaveformViz — self-contained RAF loop.
 * Parent does NOT pass progress as a prop (avoids 60fps parent re-render).
 * Instead it exposes an imperative ref API: { setProgress, setPlaying }
 */
interface WaveformHandle {
  setProgress: (p: number) => void;
  setPlaying: (v: boolean) => void;
}

const WaveformViz = React.forwardRef<WaveformHandle, Record<string, unknown>>((_props, handle) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0.3);
  const playingRef  = useRef(false);
  const rafRef      = useRef(0);
  const lastTickRef = useRef(0);

  React.useImperativeHandle(handle, () => ({
    setProgress: (p: number) => { progressRef.current = p; },
    setPlaying:  (v: boolean) => { playingRef.current = v; },
  }));

  const draw = useCallback((timestamp: number) => {
    rafRef.current = requestAnimationFrame(draw);

    // Advance playback at ~60fps, but only draw canvas at 30fps
    if (playingRef.current) {
      progressRef.current = Math.min(1, progressRef.current + 0.0008);
      if (progressRef.current >= 1) {
        progressRef.current = 0;
        playingRef.current = false;
      }
    }

    // Only redraw canvas at ~30fps
    if (timestamp - lastTickRef.current < 33) return;
    lastTickRef.current = timestamp;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const progress = progressRef.current;
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== canvas.offsetWidth * dpr) {
      canvas.width  = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    }

    const W = canvas.width / dpr;
    const H = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const total = 150;
    const played = Math.floor(total * progress);

    // Pre-build waveform points (stable — same formula)
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < total; i++) {
      const x = (i / total) * W;
      const amp = 0.28 + Math.sin(i * 0.3) * 0.12 + Math.sin(i * 0.07) * 0.2;
      pts.push({ x, y: H / 2 + Math.sin(i * 0.42) * amp * H * 0.4 });
    }

    // Played segment
    if (played > 1) {
      ctx.beginPath();
      pts.slice(0, played).forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = '#1DB954';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Unplayed segment
    if (played < total - 1) {
      ctx.beginPath();
      pts.slice(played).forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Playhead
    const px = pts[played]?.x ?? 0;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, H);
    ctx.strokeStyle = 'rgba(29,185,84,0.75)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return <canvas ref={canvasRef} className="w-full h-20" />;
});

WaveformViz.displayName = 'WaveformViz';

export const PlaybackEngine: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  // Display-only progress shown in the time counter — updated at 10fps
  const [displayProgress, setDisplayProgress] = useState(0.3);
  const waveformRef = useRef<WaveformHandle>(null);
  const displayTimerRef = useRef(0);

  const togglePlay = useCallback(() => {
    setIsPlaying((v) => {
      const next = !v;
      waveformRef.current?.setPlaying(next);
      return next;
    });
  }, []);

  const handleScrub = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const p = parseInt(e.target.value) / 100;
    setDisplayProgress(p);
    waveformRef.current?.setProgress(p);
  }, []);

  // Update display counter at 5fps only — no heavier re-renders
  useEffect(() => {
    if (!isPlaying) return;
    displayTimerRef.current = window.setInterval(() => {
      if (waveformRef.current) {
        // Read from waveform ref's internal progress (workaround: approximate)
        setDisplayProgress((p) => Math.min(1, p + 0.004));
      }
    }, 200);
    return () => clearInterval(displayTimerRef.current);
  }, [isPlaying]);

  const pipelineStages = [
    { label: 'Source',  desc: 'HTTPS Stream', icon: '☁',  active: true },
    { label: 'Decode',  desc: 'MediaCodec',   icon: '⚙',  active: true },
    { label: 'DSP',     desc: 'EQ + Filters', icon: '∿',  active: isPlaying },
    { label: 'Buffer',  desc: 'AudioTrack',   icon: '⬛', active: isPlaying },
    { label: 'Output',  desc: 'Speaker / BT', icon: '♪',  active: isPlaying },
  ];

  return (
    <section className="relative py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="scene-badge mb-4 block">Scene 08</span>
          <h2 className="font-sans font-black text-3xl md:text-4xl text-white mb-3">
            Playback <span className="text-white">Engine</span>
          </h2>
          <p className="font-mono text-brand-textMuted text-sm">ExoPlayer · MediaCodec · DSP Chain · AudioTrack</p>
        </div>

        {/* Pipeline flow */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {pipelineStages.map((stage, i) => (
            <React.Fragment key={stage.label}>
              <div
                className="dev-glass border rounded-xl px-5 py-4 text-center min-w-[90px] transition-all duration-500"
                style={{
                  borderColor: stage.active ? 'rgba(29,185,84,0.55)' : 'rgba(255,255,255,0.08)',
                  backgroundColor: stage.active ? 'rgba(29,185,84,0.07)' : 'rgba(255,255,255,0.02)',
                  boxShadow: stage.active ? '0 0 18px rgba(29,185,84,0.18)' : 'none',
                }}
              >
                <div className={`text-xl mb-1 ${stage.active ? 'text-white' : 'text-brand-textMuted'}`}>{stage.icon}</div>
                <div className="font-mono text-xs text-white">{stage.label}</div>
                <div className="font-mono text-xs text-brand-textMuted mt-1">{stage.desc}</div>
              </div>
              {i < pipelineStages.length - 1 && (
                <span className={`font-mono text-lg transition-colors duration-500 ${isPlaying ? 'text-white' : 'text-white/20'}`}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Waveform player */}
          <GlassPanel className="p-6">
            <div className="font-mono text-xs text-brand-textMuted uppercase tracking-widest mb-4">Audio Waveform</div>
            {/* WaveformViz manages its own RAF — zero parent re-renders from playback */}
            <WaveformViz ref={waveformRef} />

            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(displayProgress * 100)}
                  onChange={handleScrub}
                  className="w-full accent-brand-primary"
                />
              </div>
              <span className="font-mono text-xs text-brand-textMuted">
                {Math.floor(displayProgress * 3)}:{String(Math.floor((displayProgress * 180) % 60)).padStart(2, '0')}
              </span>
            </div>
          </GlassPanel>

          {/* Right: EQ Visualizer */}
          <GlassPanel className="p-6">
            <div className="font-mono text-xs text-brand-textMuted uppercase tracking-widest mb-2">Frequency Spectrum (FFT)</div>
            <EQBars />
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { label: 'Sample Rate', value: '48 kHz' },
                { label: 'Bit Depth',   value: '24-bit' },
                { label: 'Buffer',      value: '4096 frames' },
              ].map((m) => (
                <div key={m.label} className="text-center dev-glass rounded-lg p-3">
                  <div className="font-mono font-bold text-sm text-white">{m.value}</div>
                  <div className="font-mono text-xs text-brand-textMuted mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
};
