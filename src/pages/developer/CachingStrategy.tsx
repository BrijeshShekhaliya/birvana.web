import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from './components/GlassPanel';

type CacheResult = 'hit' | 'miss' | 'idle';

const CachePyramid: React.FC<{ activeLevel: number }> = ({ activeLevel }) => {
  const layers = [
    { label: 'L1 — Memory', desc: 'LruCache 50MB', color: '#1DB954', time: '< 1ms' },
    { label: 'L2 — Disk', desc: 'DiskLruCache 500MB', color: '#e5c07b', time: '< 5ms' },
    { label: 'L3 — Network', desc: 'CDN / API', color: '#61afef', time: '50-200ms' },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      {layers.map((layer, i) => (
        <motion.div
          key={layer.label}
          animate={{
            borderColor: i === activeLevel ? `${layer.color}80` : 'rgba(255,255,255,0.06)',
            backgroundColor: i === activeLevel ? `${layer.color}12` : 'rgba(255,255,255,0.02)',
            boxShadow: i === activeLevel ? `0 0 24px ${layer.color}25` : 'none',
          }}
          transition={{ duration: 0.4 }}
          className="border rounded-xl px-6 py-3 text-center transition-all"
          style={{ width: `${100 - i * 15}%` }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs font-bold" style={{ color: i === activeLevel ? layer.color : '#666' }}>{layer.label}</div>
              <div className="font-mono text-xs text-brand-textMuted">{layer.desc}</div>
            </div>
            <div className="font-mono text-xs" style={{ color: i === activeLevel ? layer.color : '#444' }}>{layer.time}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const CachingStrategy: React.FC = () => {
  const [result, setResult] = useState<CacheResult>('idle');
  const [activeLevel, setActiveLevel] = useState(-1);

  const simulateHit = () => {
    setResult('idle');
    setActiveLevel(0);
    setTimeout(() => {
      setResult('hit');
      setActiveLevel(-1);
    }, 600);
  };

  const simulateMiss = () => {
    setResult('idle');
    setActiveLevel(0);
    setTimeout(() => setActiveLevel(1), 500);
    setTimeout(() => setActiveLevel(2), 1000);
    setTimeout(() => {
      setResult('miss');
      setActiveLevel(-1);
    }, 1800);
  };

  return (
    <section className="relative py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="scene-badge mb-4 block">Scene 07</span>
          <h2 className="font-sans font-black text-3xl md:text-4xl text-white mb-3">
            Cache <span className="text-white">Strategy</span>
          </h2>
          <p className="font-mono text-brand-textMuted text-sm">3-layer cascade · LRU eviction · 500MB disk pool · TTL management</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Interactive pyramid */}
          <div>
            <div className="flex gap-3 justify-center mb-8">
              <button
                onClick={simulateHit}
                className="font-mono text-xs text-white border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
              >
                ✓ Simulate Cache HIT
              </button>
              <button
                onClick={simulateMiss}
                className="font-mono text-xs text-red-400 border border-red-400/30 px-4 py-2 rounded-full hover:bg-red-400/10 transition-colors"
              >
                ✕ Simulate Cache MISS
              </button>
            </div>

            <CachePyramid activeLevel={activeLevel} />

            {/* Result indicator */}
            <AnimatePresence mode="wait">
              {result !== 'idle' && (
                <motion.div
                  key={result}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-6 text-center dev-glass rounded-xl py-4 px-6 border ${
                    result === 'hit' ? 'border-brand-primary/40' : 'border-red-400/40'
                  }`}
                >
                  <div className={`font-mono font-bold text-lg ${result === 'hit' ? 'text-white' : 'text-red-400'}`}>
                    {result === 'hit' ? '⚡ Cache HIT — < 1ms' : '↓ Cache MISS — Fetching from network...'}
                  </div>
                  <div className="font-mono text-xs text-brand-textMuted mt-1">
                    {result === 'hit' ? 'Served from memory — no network required' : 'Response will be cached for future requests'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Cache stats + TTL */}
          <div className="space-y-4">
            <GlassPanel className="p-6">
              <div className="font-mono text-xs text-brand-textMuted uppercase tracking-widest mb-4">Cache Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Hit Rate', value: '87%', color: '#1DB954' },
                  { label: 'Eviction Rate', value: '3%', color: '#e5c07b' },
                  { label: 'Memory Used', value: '48 MB', color: '#61afef' },
                  { label: 'Disk Used', value: '312 MB', color: '#c678dd' },
                ].map((stat) => (
                  <div key={stat.label} className="dev-glass rounded-xl p-3 text-center">
                    <div className="font-mono font-bold text-xl" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="font-mono text-xs text-brand-textMuted mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <div className="font-mono text-xs text-brand-textMuted uppercase tracking-widest mb-4">TTL Policies</div>
              <div className="space-y-3">
                {[
                  { type: 'Search Results', ttl: '5 min', color: '#e5c07b' },
                  { type: 'Album Art', ttl: '7 days', color: '#61afef' },
                  { type: 'User Playlists', ttl: '1 hour', color: '#c678dd' },
                  { type: 'Audio Streams', ttl: 'Session', color: '#1DB954' },
                  { type: 'User Profile', ttl: '30 min', color: '#e06c75' },
                ].map((policy) => (
                  <div key={policy.type} className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-brand-textMuted">{policy.type}</span>
                    <span className="font-mono text-xs font-bold" style={{ color: policy.color }}>{policy.ttl}</span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </section>
  );
};
