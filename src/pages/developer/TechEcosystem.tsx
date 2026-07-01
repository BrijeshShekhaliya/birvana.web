import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from './components/GlassPanel';

const techData = [
  { id: 'compose', name: 'Jetpack Compose', category: 'UI', color: '#4285F4', angle: 0, r: 130, desc: 'Declarative UI framework for all screens and animations' },
  { id: 'exoplayer', name: 'ExoPlayer', category: 'Audio', color: '#1DB954', angle: 36, r: 150, desc: 'Media playback engine with adaptive streaming support' },
  { id: 'hilt', name: 'Hilt / DI', category: 'DI', color: '#c678dd', angle: 72, r: 130, desc: 'Dependency injection for modular, testable architecture' },
  { id: 'retrofit', name: 'Retrofit 2', category: 'Network', color: '#e5c07b', angle: 108, r: 145, desc: 'Type-safe HTTP client with coroutine suspend functions' },
  { id: 'room', name: 'Room DB', category: 'Storage', color: '#56b6c2', angle: 144, r: 130, desc: 'SQLite abstraction with WAL mode for offline-first storage' },
  { id: 'flow', name: 'Kotlin Flow', category: 'Async', color: '#FF6F61', angle: 180, r: 150, desc: 'Reactive streams for UI state and data layer events' },
  { id: 'coil', name: 'Coil', category: 'Images', color: '#e06c75', angle: 216, r: 130, desc: 'Coroutine-based image loading with disk cache' },
  { id: 'datastore', name: 'DataStore', category: 'Prefs', color: '#98c379', angle: 252, r: 145, desc: 'Type-safe key-value store replacing SharedPreferences' },
  { id: 'workmanager', name: 'WorkManager', category: 'Tasks', color: '#61afef', angle: 288, r: 130, desc: 'Guaranteed background tasks for downloads and sync' },
  { id: 'lottie', name: 'Lottie', category: 'Anim', color: '#FF9500', angle: 324, r: 150, desc: 'JSON-driven animations for loading states and reactions' },
];

const toRad = (deg: number) => (deg * Math.PI) / 180;

export const TechEcosystem: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hoveredTech = techData.find((t) => t.id === hoveredId);

  return (
    <section className="relative py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="scene-badge mb-4 block">Scene 11</span>
          <h2 className="font-sans font-black text-3xl md:text-4xl text-white mb-3">
            Tech <span className="text-white">Ecosystem</span>
          </h2>
          <p className="font-mono text-brand-textMuted text-sm">Hover any node to explore its role in the architecture</p>
        </div>

        <div ref={containerRef} className="relative flex flex-col items-center">
          <div className="relative" style={{ width: '100%', maxWidth: 520, height: 520 }}>
            <svg viewBox="-260 -260 520 520" className="w-full h-full">
              <defs>
                <filter id="techGlow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Orbit rings */}
              {[130, 150].map((r) => (
                <circle key={r} cx={0} cy={0} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              ))}

              {/* Connection lines when hovering */}
              {hoveredId && techData.filter(t => t.id !== hoveredId).map((tech) => {
                const x = Math.cos(toRad(tech.angle)) * tech.r;
                const y = Math.sin(toRad(tech.angle)) * tech.r;
                return (
                  <line
                    key={`line-${tech.id}`}
                    x1={0} y1={0} x2={x} y2={y}
                    stroke={hoveredTech?.color ?? '#1DB954'}
                    strokeWidth="0.5"
                    opacity="0.25"
                  />
                );
              })}

              {/* Technology nodes */}
              {techData.map((tech) => {
                const x = Math.cos(toRad(tech.angle)) * tech.r;
                const y = Math.sin(toRad(tech.angle)) * tech.r;
                const isHovered = hoveredId === tech.id;

                return (
                  <g
                    key={tech.id}
                    transform={`translate(${x},${y})`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredId(tech.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ transition: 'transform 0.3s ease' }}
                  >
                    {isHovered && (
                      <circle r="28" fill="none" stroke={tech.color} strokeWidth="1" opacity="0.35">
                        <animate attributeName="r" values="28;36;28" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.35;0.1;0.35" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      r="20"
                      fill={isHovered ? `${tech.color}22` : 'rgba(255,255,255,0.04)'}
                      stroke={isHovered ? tech.color : 'rgba(255,255,255,0.1)'}
                      strokeWidth={isHovered ? 1.5 : 1}
                      filter={isHovered ? 'url(#techGlow)' : undefined}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{ fontSize: '7px', fill: isHovered ? tech.color : '#777', transition: 'fill 0.3s ease', fontFamily: 'JetBrains Mono', fontWeight: 600 }}
                    >
                      {tech.category}
                    </text>
                    <text
                      y="28"
                      textAnchor="middle"
                      style={{ fontSize: '6.5px', fill: isHovered ? '#fff' : '#444', transition: 'fill 0.3s ease', fontFamily: 'JetBrains Mono' }}
                    >
                      {tech.name}
                    </text>
                  </g>
                );
              })}

              {/* Center Birvana Core */}
              <g>
                <circle r="44" fill="rgba(29,185,84,0.07)" stroke="rgba(29,185,84,0.35)" strokeWidth="1.5" filter="url(#techGlow)">
                  <animate attributeName="r" values="44;48;44" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle r="34" fill="rgba(29,185,84,0.1)" stroke="rgba(29,185,84,0.25)" strokeWidth="1" />
                <text textAnchor="middle" y="-6" style={{ fontSize: '9px', fill: '#1DB954', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>Birvana</text>
                <text textAnchor="middle" y="6" style={{ fontSize: '7px', fill: '#1DB954', fontFamily: 'JetBrains Mono' }}>Core</text>
                <text textAnchor="middle" y="18" style={{ fontSize: '5.5px', fill: 'rgba(29,185,84,0.5)', fontFamily: 'JetBrains Mono' }}>Kotlin + MVVM</text>
              </g>
            </svg>
          </div>

          {/* Info card */}
          <div className="mt-4 w-full max-w-md min-h-[80px] flex items-center justify-center">
            {hoveredTech ? (
              <motion.div
                key={hoveredTech.id}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full"
              >
                <GlassPanel className="px-6 py-4 text-center" glowColor={`${hoveredTech.color}30`}>
                  <div className="font-mono font-bold text-sm mb-1" style={{ color: hoveredTech.color }}>
                    {hoveredTech.name}
                  </div>
                  <div className="font-mono text-xs text-brand-textSecondary">{hoveredTech.desc}</div>
                </GlassPanel>
              </motion.div>
            ) : (
              <p className="font-mono text-xs text-brand-textMuted">← Hover a technology node</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
