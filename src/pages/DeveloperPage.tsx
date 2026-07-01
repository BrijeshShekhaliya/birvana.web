import React, { Suspense, lazy } from 'react';
import { Navigation } from '../components/Navigation';
import { DevHero } from './developer/DevHero';
import './developer/dev-page.css';

const ArchitectureMap    = lazy(() => import('./developer/ArchitectureMap').then(m => ({ default: m.ArchitectureMap })));
const AuthScene          = lazy(() => import('./developer/AuthScene').then(m => ({ default: m.AuthScene })));
const SearchPipeline     = lazy(() => import('./developer/SearchPipeline').then(m => ({ default: m.SearchPipeline })));
const StreamingPipeline  = lazy(() => import('./developer/StreamingPipeline').then(m => ({ default: m.StreamingPipeline })));
const CachingStrategy    = lazy(() => import('./developer/CachingStrategy').then(m => ({ default: m.CachingStrategy })));
const PlaybackEngine     = lazy(() => import('./developer/PlaybackEngine').then(m => ({ default: m.PlaybackEngine })));
const TechEcosystem      = lazy(() => import('./developer/TechEcosystem').then(m => ({ default: m.TechEcosystem })));
const PerformanceMetrics = lazy(() => import('./developer/PerformanceMetrics').then(m => ({ default: m.PerformanceMetrics })));
const SecurityScene      = lazy(() => import('./developer/SecurityScene').then(m => ({ default: m.SecurityScene })));
const AIFeatures         = lazy(() => import('./developer/AIFeatures').then(m => ({ default: m.AIFeatures })));
const APKDistribution    = lazy(() => import('./developer/APKDistribution').then(m => ({ default: m.APKDistribution })));
import { Footer } from '../components/Footer';

// Simple divider — no extra vertical padding
const Divider: React.FC<{ n: number; label: string }> = ({ n, label }) => (
  <div className="flex items-center gap-4 px-6 max-w-5xl mx-auto w-full">
    <div className="h-px flex-1 bg-white/5" />
    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/8 bg-[#0a0a0a]">
      <span className="font-mono text-xs text-brand-textMuted">{String(n).padStart(2, '0')}</span>
      <span className="font-mono text-xs text-white uppercase tracking-wider">{label}</span>
    </div>
    <div className="h-px flex-1 bg-white/5" />
  </div>
);

const Skeleton: React.FC = () => (
  <div className="h-20 flex items-center justify-center">
    <div className="w-1 h-1 rounded-full bg-[#1DB954]/30 animate-pulse" />
  </div>
);

export const DeveloperPage: React.FC = () => (
  <div className="bg-brand-bg min-h-screen text-white overflow-x-hidden">
    <Navigation />

    <main>
      <DevHero />

      <Suspense fallback={<Skeleton />}><Divider n={1} label="System Architecture" /><ArchitectureMap /></Suspense>
      <Suspense fallback={<Skeleton />}><Divider n={2} label="Authentication Flow" /><AuthScene /></Suspense>
      <Suspense fallback={<Skeleton />}><Divider n={3} label="Search Pipeline" /><SearchPipeline /></Suspense>
      <Suspense fallback={<Skeleton />}><Divider n={4} label="Streaming Pipeline" /><StreamingPipeline /></Suspense>
      <Suspense fallback={<Skeleton />}><Divider n={5} label="Caching Strategy" /><CachingStrategy /></Suspense>
      <Suspense fallback={<Skeleton />}><Divider n={6} label="Playback Engine" /><PlaybackEngine /></Suspense>
      <Suspense fallback={<Skeleton />}><Divider n={7} label="Tech Ecosystem" /><TechEcosystem /></Suspense>
      <Suspense fallback={<Skeleton />}><Divider n={8} label="Performance" /><PerformanceMetrics /></Suspense>
      <Suspense fallback={<Skeleton />}><Divider n={9} label="Security" /><SecurityScene /></Suspense>
      <Suspense fallback={<Skeleton />}><Divider n={10} label="AI Intelligence" /><AIFeatures /></Suspense>
      <Suspense fallback={<Skeleton />}><Divider n={11} label="APK Distribution" /><APKDistribution /></Suspense>
    </main>

    <Footer />
  </div>
);
