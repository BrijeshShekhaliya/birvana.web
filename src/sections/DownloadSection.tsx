import React from 'react';
import { Compass, Settings, Play, ShieldCheck, Heart } from 'lucide-react';
import { MagneticButton } from '../components/MagneticButton';

export const DownloadSection: React.FC = () => {
  return (
    <section 
      id="download" 
      className="relative min-h-[90dvh] w-full bg-brand-bg py-24 px-6 md:px-8 border-b border-brand-borderSubtle flex flex-col justify-center overflow-hidden"
    >
      {/* Background Soft Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-brand-primary/5 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1100px] mx-auto w-full z-10">
        
        {/* Section Title */}
        <div className="text-center mb-16">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-primary mb-3 block">Get Started</span>
          <h2 className="font-sans font-black text-3xl md:text-5xl text-white tracking-tight">
            Install Birvana & Setup
          </h2>
          <p className="font-sans text-brand-textSecondary text-sm md:text-base max-w-xl mx-auto mt-4 leading-relaxed">
            Get the official application directly from Google Play Store and configure the modular streaming engine in seconds.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* LEFT: Google Play Store Card (Install) */}
          <div className="lg:col-span-5 bg-[#090909] border border-white/5 rounded-3xl p-8 flex flex-col justify-between gap-8 shadow-2xl relative overflow-hidden group animate-playstore-glow">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-primary font-black px-2.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 inline-block">Official Store Release</span>
              <h3 className="font-sans font-black text-3xl text-white">Google Play</h3>
              <p className="font-sans text-brand-textSecondary text-sm leading-relaxed">
                Download the official release for automatic updates, cloud database sync, and verified device security.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Animated Button */}
              <div className="flex justify-start relative group/btn">
                <MagneticButton 
                  variant="primary" 
                  className="!w-full !flex !items-center !justify-center !gap-3.5 !px-6 !py-5 !rounded-2xl animate-shimmer-btn text-black font-sans font-black text-sm tracking-wide shadow-[0_12px_24px_-8px_rgba(29,185,84,0.4)] border-transparent"
                  href="https://play.google.com/store/apps/details?id=com.birvana.mobile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg" className="shrink-0 fill-current text-black">
                    <path d="M3.25 2.5v19l8.5-8.5-8.5-8.5z"/>
                    <path d="M3.25 2.5l8.5 8.5 4.5-4.5-10-6c-.75-.45-2-.25-3 2z"/>
                    <path d="M3.25 21.5c1 1.2 2.25 1.4 3 1l10-6-4.5-4.5-8.5 9.5z"/>
                    <path d="M11.75 11l4.5-4.5 4.5 2.5c1 .55 1 1.45 0 2l-4.5 2.5-4.5-4.5z"/>
                  </svg>
                  <span>GET IT ON GOOGLE PLAY</span>
                </MagneticButton>
              </div>

              {/* Status List */}
              <div className="space-y-2.5 border-t border-white/5 pt-5">
                <div className="flex items-center gap-2.5 text-xs text-brand-textMuted font-mono">
                  <ShieldCheck size={14} className="text-brand-primary shrink-0" />
                  <span>Verified Secure by Play Protect</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-brand-textMuted font-mono">
                  <Heart size={14} className="text-brand-primary shrink-0" />
                  <span>100% Free · No Ads · Open Source</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Stac Engine Setup Guide */}
          <div className="lg:col-span-7 bg-[#090909] border border-white/5 rounded-3xl p-8 flex flex-col justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-textMuted font-black px-2.5 py-1 rounded-full bg-white/5 border border-white/10 inline-block">Streaming Engine Guide</span>
              <h3 className="font-sans font-black text-3xl text-white">How to Enable Stac Engine</h3>
              <p className="font-sans text-brand-textSecondary text-sm leading-relaxed">
                Birvana uses a modular client core (Stac Engine) to fetch metadata and audio streams from external databases in real-time. Follow these steps to activate streaming:
              </p>
            </div>

            {/* Steps Container */}
            <div className="grid grid-cols-1 gap-4 text-left">
              {[
                {
                  step: 1,
                  title: 'Open App Settings',
                  desc: 'Launch Birvana on your Android device and tap the settings gear icon in the top-right corner.',
                  icon: <Settings size={16} className="text-brand-primary" />
                },
                {
                  step: 2,
                  title: 'Navigate to Audio Engine',
                  desc: 'Scroll down to the "Streaming & Source Settings" section and tap on "Engine Configuration".',
                  icon: <Compass size={16} className="text-brand-primary" />
                },
                {
                  step: 3,
                  title: 'Activate the Stac Core',
                  desc: 'Toggle the "Stac Engine" switch to Enable. This activates your device\'s local streaming pipelines.',
                  icon: <Play size={16} className="text-brand-primary" />
                },
                {
                  step: 4,
                  title: 'Enjoy High-Fidelity Music',
                  desc: 'Search for any artist or song. The engine will automatically compile high-quality streams for playback.',
                  icon: <ShieldCheck size={16} className="text-brand-primary" />
                }
              ].map((s) => (
                <div key={s.step} className="flex gap-4 items-start p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-brand-primary/15 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
                    <span className="font-mono font-black text-xs text-brand-primary">{s.step}</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-sans font-bold text-sm text-white flex items-center gap-2">
                      {s.title}
                    </h4>
                    <p className="font-sans text-brand-textSecondary text-xs leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
