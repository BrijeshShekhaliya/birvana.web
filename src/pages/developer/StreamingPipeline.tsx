import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from './components/GlassPanel';

const StreamingAnimation: React.FC<{ quality: '128' | '256' | '320' | 'FLAC' }> = ({ quality }) => {
  const colors: Record<string, string> = { '128': '#e06c75', '256': '#e5c07b', '320': '#61afef', 'FLAC': '#1DB954' };
  const color = colors[quality];

  return (
    <div className="flex items-center gap-1 overflow-hidden w-full">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full shrink-0"
          style={{ width: 10, height: 10, backgroundColor: color }}
          animate={{ opacity: [0, 1, 0.5] }}
          transition={{ delay: i * 0.08, duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

export const StreamingPipeline: React.FC = () => {
  const [quality, setQuality] = useState<'128' | '256' | '320' | 'FLAC'>('320');
  const [bufferFill, setBufferFill] = useState(0);

  useEffect(() => {
    setBufferFill(0);
    const target = quality === 'FLAC' ? 95 : quality === '320' ? 87 : quality === '256' ? 75 : 60;
    let current = 0;
    const timer = setInterval(() => {
      current += 2;
      setBufferFill(Math.min(current, target));
      if (current >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [quality]);

  const pipeline = [
    { label: 'CDN Edge', icon: '☁️', desc: 'Cloudflare' },
    { label: 'HTTPS', icon: '🔒', desc: 'TLS 1.3' },
    { label: 'OkHttp', icon: '⟷', desc: 'HTTP/2' },
    { label: 'ExoPlayer', icon: '▶', desc: 'HLS / DASH' },
    { label: 'Buffer', icon: '⬛', desc: '8MB ring' },
    { label: 'AudioTrack', icon: '♪', desc: 'PCM out' },
  ];

  return (
    <section className="relative py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="scene-badge mb-4 block">Scene 05</span>
          <h2 className="font-sans font-black text-3xl md:text-4xl text-white mb-3">
            Streaming <span className="text-white">Pipeline</span>
          </h2>
          <p className="font-mono text-brand-textMuted text-sm">Adaptive bitrate · HLS · HTTP/2 · 8MB ring buffer</p>
        </div>

        {/* Pipeline flow */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {pipeline.map((stage, i) => (
            <React.Fragment key={stage.label}>
              <GlassPanel className="px-4 py-3 text-center min-w-[80px]">
                <div className="text-lg mb-1">{stage.icon}</div>
                <div className="font-mono text-xs text-white">{stage.label}</div>
                <div className="font-mono text-[8px] text-brand-textMuted">{stage.desc}</div>
              </GlassPanel>
              {i < pipeline.length - 1 && (
                <div className="font-mono text-white/60">→</div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Packet animation */}
        <GlassPanel className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-brand-textMuted uppercase tracking-widest">Data Packets</span>
            <div className="flex gap-2">
              {(['128', '256', '320', 'FLAC'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`font-mono text-xs px-3 py-1 rounded-full border transition-all ${quality === q ? 'border-brand-primary bg-white/5 text-white' : 'border-white/10 text-brand-textMuted hover:border-white/30'}`}
                >
                  {q}{q !== 'FLAC' ? 'k' : ''}
                </button>
              ))}
            </div>
          </div>
          <StreamingAnimation quality={quality} />
          <div className="flex justify-between mt-2">
            <span className="font-mono text-xs text-brand-textMuted">CDN</span>
            <span className="font-mono text-xs text-brand-textMuted">Speaker</span>
          </div>
        </GlassPanel>

        {/* Buffer visualization */}
        <div className="grid sm:grid-cols-2 gap-6">
          <GlassPanel className="p-6">
            <div className="font-mono text-xs text-brand-textMuted uppercase tracking-widest mb-4">Ring Buffer Status</div>
            <div className="relative h-8 bg-white/5 rounded-full overflow-hidden mb-2">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: 'linear-gradient(90deg, #0C3320, #1DB954)' }}
                animate={{ width: `${bufferFill}%` }}
                transition={{ duration: 0.3 }}
              />
              <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-white">
                {bufferFill}% buffered
              </div>
            </div>
            <div className="font-mono text-xs text-brand-textMuted">
              {quality === 'FLAC' ? '~45s' : quality === '320' ? '~90s' : '~120s'} of playback pre-buffered
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="font-mono text-xs text-brand-textMuted uppercase tracking-widest mb-4">Adaptive Bitrate Logic</div>
            <div className="space-y-2">
              {[
                { cond: 'WiFi + Fast', bitrate: 'FLAC / 320kbps' },
                { cond: '4G LTE', bitrate: '256kbps' },
                { cond: '3G / Weak', bitrate: '128kbps' },
                { cond: 'Offline', bitrate: 'Cached WAV / MP3' },
              ].map((row) => (
                <div key={row.cond} className="flex justify-between items-center">
                  <span className="font-mono text-xs text-brand-textMuted">{row.cond}</span>
                  <span className="font-mono text-xs text-white">{row.bitrate}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
};
