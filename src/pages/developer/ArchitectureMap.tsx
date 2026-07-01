import React, { useRef, useEffect, useState } from 'react';

const VW = 600;
const VH = 680;

interface ArchNode {
  id: string; label: string; sublabel: string; icon: string; color: string;
  x: number; y: number; connections: string[];
}

const nodes: ArchNode[] = [
  { id: 'frontend',    label: 'Jetpack Compose UI',          sublabel: 'Frontend',        icon: '◈', color: '#61afef', x: 50, y: 4,  connections: ['apiLayer'] },
  { id: 'apiLayer',   label: 'Retrofit + OkHttp',           sublabel: 'API Layer',        icon: '⟷', color: '#e5c07b', x: 50, y: 15, connections: ['auth', 'search'] },
  { id: 'auth',       label: 'JWT + OAuth2',                 sublabel: 'Auth',             icon: '🔐', color: '#c678dd', x: 24, y: 27, connections: ['cache'] },
  { id: 'search',     label: 'Multi-Provider Search',        sublabel: 'Search Engine',    icon: '⌕', color: '#1DB954', x: 76, y: 27, connections: ['cache', 'providers'] },
  { id: 'cache',      label: 'LRU + DiskLru',               sublabel: 'Cache Layer',      icon: '⚡', color: '#e06c75', x: 35, y: 40, connections: ['database'] },
  { id: 'providers',  label: 'YT / Saavn / Spotify',        sublabel: 'Music Providers',  icon: '♫', color: '#1DB954', x: 72, y: 40, connections: ['audioEngine'] },
  { id: 'database',   label: 'Room DB + SQLite WAL',        sublabel: 'Local Storage',    icon: '⊞', color: '#56b6c2', x: 35, y: 53, connections: ['audioEngine'] },
  { id: 'audioEngine',label: 'ExoPlayer Core',              sublabel: 'Audio Engine',     icon: '▶', color: '#e5c07b', x: 55, y: 63, connections: ['dsp', 'visualizer'] },
  { id: 'dsp',        label: 'Equalizer + DSP',             sublabel: 'Audio Processing', icon: '∿', color: '#c678dd', x: 30, y: 75, connections: ['output'] },
  { id: 'visualizer', label: 'FFT Visualizer',              sublabel: 'Visual Engine',    icon: '◉', color: '#1DB954', x: 70, y: 75, connections: ['output'] },
  { id: 'output',     label: 'AudioTrack Output',           sublabel: 'Playback',         icon: '♪', color: '#61afef', x: 50, y: 87, connections: ['ai'] },
  { id: 'ai',         label: 'Recommendation AI',          sublabel: 'Intelligence',     icon: '✦', color: '#1DB954', x: 50, y: 97, connections: [] },
];

function px(node: ArchNode) {
  return { x: (node.x / 100) * VW, y: (node.y / 100) * VH };
}

const OFFSETS: Record<string, number> = {
  'frontend-apiLayer': 0, 'apiLayer-auth': -28, 'apiLayer-search': 28,
  'auth-cache': -18, 'search-cache': 0, 'search-providers': 22,
  'cache-database': -14, 'providers-audioEngine': 18, 'database-audioEngine': -18,
  'audioEngine-dsp': -18, 'audioEngine-visualizer': 18, 'dsp-output': -14,
  'visualizer-output': 14, 'output-ai': 0,
};

interface Conn { from: ArchNode; to: ArchNode; id: string; d: string; len: number }

const CONNS: Conn[] = [];
nodes.forEach(node => node.connections.forEach(toId => {
  const to = nodes.find(n => n.id === toId);
  if (!to) return;
  const id = `${node.id}-${toId}`;
  const fp = px(node), tp = px(to);
  const off = OFFSETS[id] ?? 0;
  const d = `M${fp.x},${fp.y} Q${(fp.x + tp.x) / 2 + off},${(fp.y + tp.y) / 2} ${tp.x},${tp.y}`;
  const len = Math.hypot(tp.x - fp.x, tp.y - fp.y) * 1.15;
  CONNS.push({ from: node, to, id, d, len });
}));

export const ArchitectureMap: React.FC = () => {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const [activeSet, setActiveSet] = useState<Set<string>>(new Set());
  const [started, setStarted]     = useState(false);

  // Trigger animation when section scrolls into view — NO pin, NO GSAP
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        // Stagger-activate nodes one by one using setTimeout (no scroll cost)
        nodes.forEach((node, i) => {
          setTimeout(() => {
            setActiveSet(prev => new Set([...prev, node.id]));
          }, i * 180);
        });
      }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  return (
    <section ref={sectionRef} className="relative py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="scene-badge mb-3 inline-block">Scene 01</span>
          <h2 className="font-sans font-black text-3xl md:text-5xl text-white">
            System <span className="text-white">Architecture</span>
          </h2>
          <p className="font-mono text-brand-textMuted text-xs mt-2">
            {started ? 'Building the system…' : 'Scroll to build the system'}
          </p>
        </div>

        <div style={{ width: '100%' }}>
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            className="w-full"
            style={{ maxHeight: '70vh' }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <marker id="arr" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                <path d="M0,0 L0,5 L5,2.5 Z" fill="rgba(29,185,84,0.5)" />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Connection lines */}
            {CONNS.map((c, i) => {
              const active = activeSet.has(c.from.id) && activeSet.has(c.to.id);
              return (
                <g key={c.id}>
                  <path d={c.d} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
                  <path
                    d={c.d} fill="none"
                    stroke={active ? 'rgba(29,185,84,0.5)' : 'rgba(29,185,84,0.06)'}
                    strokeWidth={active ? 1.8 : 0.8}
                    strokeDasharray={c.len}
                    strokeDashoffset={active ? 0 : c.len}
                    markerEnd={active ? 'url(#arr)' : undefined}
                    style={{ transition: `stroke-dashoffset 0.6s ${i * 0.05}s ease, stroke 0.4s ease` }}
                  />
                  {/* Travelling dot — only on active connections */}
                  {active && (
                    <circle r="3" fill="#1DB954" filter="url(#glow)">
                      <animateMotion dur={`${1.6 + i * 0.2}s`} repeatCount="indefinite" path={c.d} />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const pos = px(node);
              const active = activeSet.has(node.id);
              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x},${pos.y})`}
                  style={{ opacity: active ? 1 : 0, transition: 'opacity 0.4s ease' }}
                >
                  {active && (
                    <circle r="26" fill="none" stroke={node.color} strokeWidth="0.8" opacity="0.2">
                      <animate attributeName="r" values="26;32;26" dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle r="18"
                    fill={active ? `${node.color}15` : 'rgba(255,255,255,0.03)'}
                    stroke={active ? node.color : 'rgba(255,255,255,0.08)'}
                    strokeWidth={active ? 1.4 : 0.8}
                    filter={active ? 'url(#glow)' : undefined}
                    style={{ transition: 'all 0.4s ease' }}
                  />
                  <text textAnchor="middle" dominantBaseline="central"
                    style={{ fontSize: '11px', fill: active ? node.color : '#333', transition: 'fill 0.4s ease', fontFamily: 'sans-serif' }}>
                    {node.icon}
                  </text>
                  <text y="26" textAnchor="middle"
                    style={{ fontSize: '7px', fill: active ? '#aaa' : '#333', transition: 'fill 0.4s ease', fontFamily: 'monospace', fontWeight: 600 }}>
                    {node.sublabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Active node label */}
        <div className="mt-4 h-8 flex items-center justify-center">
          {Array.from(activeSet).slice(-1).map(id => {
            const node = nodes.find(n => n.id === id);
            if (!node) return null;
            return (
              <div key={id} className="dev-glass rounded-full px-5 py-1.5 flex items-center gap-2">
                <span style={{ color: node.color, fontSize: 14 }}>{node.icon}</span>
                <span className="font-mono text-xs text-white">{node.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
