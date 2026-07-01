import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from './components/GlassPanel';

const providers = [
  { name: 'YouTube Music', color: '#FF0000', icon: '▶', results: 847, latency: 120 },
  { name: 'JioSaavn', color: '#1DB954', icon: '♫', results: 312, latency: 95 },
  { name: 'Spotify', color: '#1ed760', icon: '◉', results: 623, latency: 140 },
];

const sampleResults = [
  { title: 'Blinding Lights', artist: 'The Weeknd', source: 'YT', score: 0.98 },
  { title: 'Blinding Lights (Radio Edit)', artist: 'The Weeknd', source: 'Saavn', score: 0.95 },
  { title: 'Blinding Lights (Official Video)', artist: 'The Weeknd', source: 'Spotify', score: 0.91 },
  { title: 'Save Your Tears', artist: 'The Weeknd', source: 'YT', score: 0.72 },
  { title: 'Starboy', artist: 'The Weeknd ft. Daft Punk', source: 'Saavn', score: 0.65 },
];

const TerminalLine: React.FC<{ text: string; delay: number; color?: string }> = ({ text, delay, color = '#98c379' }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-mono text-[12px] leading-relaxed"
          style={{ color }}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SearchPipeline: React.FC = () => {
  const [searching, setSearching] = useState(false);
  const [done, setDone] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setDone(false);
    setTimeout(() => setDone(true), 3500);
  };

  return (
    <section className="relative py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="scene-badge mb-4 block">Scene 03</span>
          <h2 className="font-sans font-black text-3xl md:text-4xl text-white mb-3">
            Search <span className="text-white">Pipeline</span>
          </h2>
          <p className="font-mono text-brand-textMuted text-sm">Parallel API calls · Intelligent merging · Relevance scoring</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: terminal */}
          <div>
            <div className="dev-terminal rounded-xl overflow-hidden mb-4">
              <div className="dev-terminal-header">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <span className="ml-2 text-xs font-mono text-brand-textMuted">birvana:search $</span>
              </div>
              <div className="p-5 space-y-1 min-h-[200px]">
                {searching ? (
                  <>
                    <TerminalLine text={`$ search "${query}"`} delay={0} color="#61afef" />
                    <TerminalLine text="→ Dispatching parallel requests..." delay={300} color="#e5c07b" />
                    <TerminalLine text="  [YouTube Music]   ✓ 847 results  (120ms)" delay={800} color="#FF0000" />
                    <TerminalLine text="  [JioSaavn]        ✓ 312 results  (95ms)" delay={1100} color="#1DB954" />
                    <TerminalLine text="  [Spotify]         ✓ 623 results  (140ms)" delay={1400} color="#1ed760" />
                    <TerminalLine text="→ Deduplication pass: 432 unique" delay={2000} color="#c678dd" />
                    <TerminalLine text="→ Relevance scoring (BM25 + fuzzy)..." delay={2500} color="#e5c07b" />
                    <TerminalLine text="✓ Top 20 results ready (total: 140ms)" delay={3200} color="#1DB954" />
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-white">$</span>
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                      placeholder="type a song name and press Enter..."
                      className="bg-transparent outline-none flex-1 font-mono text-xs text-white placeholder-brand-textMuted"
                    />
                    <span className="typewriter-cursor" />
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={searching ? () => { setSearching(false); setDone(false); setQuery(''); } : runSearch}
              className="font-mono text-xs text-white border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
            >
              {searching ? '✕ Reset' : '▶ Run Search'}
            </button>
          </div>

          {/* Right: provider cards + results */}
          <div className="space-y-4">
            {/* Provider status */}
            <div className="grid grid-cols-3 gap-3">
              {providers.map((p, i) => (
                <motion.div
                  key={p.name}
                  animate={{
                    borderColor: searching ? `${p.color}80` : 'rgba(255,255,255,0.08)',
                    boxShadow: searching ? `0 0 20px ${p.color}20` : 'none',
                  }}
                  transition={{ delay: i * 0.3, duration: 0.5 }}
                  className="dev-glass rounded-xl p-4 text-center border transition-all"
                >
                  <div className="text-xl mb-2" style={{ color: p.color }}>{p.icon}</div>
                  <div className="font-mono text-xs text-brand-textSecondary">{p.name}</div>
                  {searching && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.3 }}
                      className="mt-2"
                    >
                      <div className="font-mono text-xs" style={{ color: p.color }}>{p.results}</div>
                      <div className="font-mono text-xs text-brand-textMuted">{p.latency}ms</div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Merged results */}
            <AnimatePresence>
              {done && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <GlassPanel className="p-4">
                    <div className="font-mono text-xs text-brand-textMuted uppercase tracking-widest mb-3">Merged Results — Relevance Score</div>
                    <div className="space-y-2">
                      {sampleResults.map((r, i) => (
                        <motion.div
                          key={r.title}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="font-mono text-xs text-brand-textMuted w-4">{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-xs text-white truncate">{r.title}</div>
                            <div className="font-mono text-xs text-brand-textMuted truncate">{r.artist}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-20 h-1 rounded-full bg-white/10 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${r.score * 100}%` }}
                                transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                                className="h-full rounded-full bg-brand-primary"
                              />
                            </div>
                            <div className="font-mono text-xs text-white w-8 text-right">{(r.score * 100).toFixed(0)}%</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </GlassPanel>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
