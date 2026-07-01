import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParticleCanvas } from './hooks/useParticleCanvas';

const codeSnippets = [
  {
    title: 'AudioEngine.kt',
    lines: [
      { tokens: [{ t: 'class', c: 'token-keyword' }, { t: ' AudioEngine(', c: '' }, { t: 'private val', c: 'token-keyword' }, { t: ' exo: ExoPlayer)', c: '' }] },
      { tokens: [{ t: '  fun', c: 'token-keyword' }, { t: ' stream(url: ', c: '' }, { t: 'String', c: 'token-type' }, { t: ') =', c: '' }] },
      { tokens: [{ t: '    MediaItem.fromUri(url)', c: 'token-function' }] },
      { tokens: [{ t: '  // Lossless FLAC support', c: 'token-comment' }] },
    ],
  },
  {
    title: 'SearchApi.kt',
    lines: [
      { tokens: [{ t: 'suspend fun', c: 'token-keyword' }, { t: ' search(q: ', c: '' }, { t: 'String', c: 'token-type' }, { t: '): Flow<Result> {', c: '' }] },
      { tokens: [{ t: '  return', c: 'token-keyword' }, { t: ' combine(', c: 'token-function' }] },
      { tokens: [{ t: '    youtube.search(q),', c: 'token-green' }] },
      { tokens: [{ t: '    jiosaavn.search(q)', c: 'token-green' }] },
      { tokens: [{ t: '  ) { a, b -> merge(a, b) }', c: '' }] },
    ],
  },
];

export const DevHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);

  // Lightweight particle canvas — pauses when off-screen
  useParticleCanvas(canvasRef, { count: 35, maxDistance: 80, speed: 0.15 });

  // Scroll fade-out via CSS custom property — no Framer Motion, no re-renders
  useEffect(() => {
    const section = containerRef.current;
    if (!section) return;
    const onScroll = () => {
      const p = Math.min(window.scrollY / window.innerHeight, 1);
      section.style.setProperty('--hero-scroll', String(p));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      ref={containerRef}
      id="dev-hero"
      className="hero-parallax-section relative min-h-[90vh] w-full overflow-hidden flex items-center justify-center bg-brand-bg"
    >
      {/* Subtle particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Simple static dark gradient — no mouse tracking */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(255,255,255,0.03) 0%, transparent 65%)',
      }} />

      {/* Floating code panels — visible only on large screens */}
      <div className="absolute inset-0 pointer-events-none hidden xl:block">
        <div
          className="absolute dev-glass rounded-xl overflow-hidden"
          style={{ top: '18%', left: '3%', width: 260, opacity: 0, animation: 'heroFadeIn 0.8s 0.6s ease-out forwards' }}
        >
          <div className="dev-terminal-header">
            <div className="w-2 h-2 rounded-full bg-red-500/60" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
            <div className="w-2 h-2 rounded-full bg-green-500/60" />
            <span className="ml-2 font-mono text-xs text-brand-textMuted">{codeSnippets[0].title}</span>
          </div>
          <div className="p-4 font-mono text-xs leading-relaxed">
            {codeSnippets[0].lines.map((line, i) => (
              <div key={i} className="flex flex-wrap">
                {line.tokens.map((t, j) => <span key={j} className={t.c}>{t.t}</span>)}
              </div>
            ))}
          </div>
        </div>

        <div
          className="absolute dev-glass rounded-xl overflow-hidden"
          style={{ top: '22%', right: '3%', width: 280, opacity: 0, animation: 'heroFadeIn 0.8s 0.9s ease-out forwards' }}
        >
          <div className="dev-terminal-header">
            <div className="w-2 h-2 rounded-full bg-red-500/60" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
            <div className="w-2 h-2 rounded-full bg-green-500/60" />
            <span className="ml-2 font-mono text-xs text-brand-textMuted">{codeSnippets[1].title}</span>
          </div>
          <div className="p-4 font-mono text-xs leading-relaxed">
            {codeSnippets[1].lines.map((line, i) => (
              <div key={i} className="flex flex-wrap">
                {line.tokens.map((t, j) => <span key={j} className={t.c}>{t.t}</span>)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero content */}
      <div className="hero-content relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-5"
        >
          <span className="font-mono text-xs text-white border border-white/10 rounded-full px-4 py-1.5 bg-white/5 uppercase tracking-widest">
            Engineering Journal
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans font-black text-4xl sm:text-5xl md:text-6xl tracking-tighter leading-[1] mb-5"
        >
          <span className="text-white">Engineering</span>{' '}
          <span className="text-white">Birvana</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="text-brand-textSecondary text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed"
        >
          Architecture, audio engine, APIs, and engineering philosophy of a premium Android music app.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-6"
        >
          {[
            { label: 'Scenes', value: '11' },
            { label: 'API Providers', value: '3' },
            { label: 'Kotlin LoC', value: '28K' },
            { label: 'Animations', value: '60fps' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-mono font-bold text-xl text-white">{stat.value}</div>
              <div className="font-mono text-xs text-brand-textMuted uppercase tracking-widest mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col items-center gap-2 mt-10"
        >
          <span className="font-mono text-xs tracking-widest uppercase text-brand-textMuted">Scroll</span>
          <div className="scroll-indicator-line w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
};
