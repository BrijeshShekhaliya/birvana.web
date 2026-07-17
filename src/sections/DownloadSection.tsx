import React from 'react';
import { Compass, Settings, Play, ShieldCheck, Heart, User } from 'lucide-react';
import { MagneticButton } from '../components/MagneticButton';

export const DownloadSection: React.FC = () => {
  return (
    <section 
      id="download" 
      className="relative min-h-[90dvh] w-full bg-brand-bg py-24 px-6 md:px-8 border-b border-brand-borderSubtle flex flex-col justify-center overflow-hidden"
    >
      {/* Background Soft Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-primary/5 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="max-w-[850px] mx-auto w-full z-10 flex flex-col gap-16">
        
        {/* Google Play Installation Card */}
        <div className="w-full flex flex-col items-center">
          
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-primary mb-3 block">Get the App</span>
            <h2 className="font-sans font-black text-3xl md:text-5xl text-white tracking-tight">
              Install Birvana
            </h2>
            <p className="font-sans text-brand-textSecondary text-sm md:text-base max-w-xl mx-auto mt-4 leading-relaxed">
              Get the official application directly from the Google Play Store to enjoy auto-updates and full cloud capability.
            </p>
          </div>

          {/* Compact centered card - no empty vertical spaces */}
          <div className="w-full max-w-[500px] bg-[#090909] border border-white/5 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden group animate-playstore-glow text-center items-center">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-primary font-black px-2.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 inline-block">Official Store Release</span>
              <h3 className="font-sans font-black text-2xl text-white">Google Play</h3>
            </div>

            <div className="w-full flex flex-col gap-3">
              <div className="w-full relative group/btn">
                <MagneticButton 
                  variant="primary" 
                  className="!w-full !flex !items-center !justify-center !gap-3.5 !px-6 !py-4.5 !rounded-2xl animate-shimmer-btn text-black font-sans font-black text-xs tracking-wider shadow-[0_12px_24px_-8px_rgba(29,185,84,0.4)] border-transparent"
                  href="https://play.google.com/store/apps/details?id=com.birvana.mobile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" className="shrink-0 fill-current text-black">
                    <path d="M3.25 2.5v19l8.5-8.5-8.5-8.5z"/>
                    <path d="M3.25 2.5l8.5 8.5 4.5-4.5-10-6c-.75-.45-2-.25-3 2z"/>
                    <path d="M3.25 21.5c1 1.2 2.25 1.4 3 1l10-6-4.5-4.5-8.5 9.5z"/>
                    <path d="M11.75 11l4.5-4.5 4.5 2.5c1 .55 1 1.45 0 2l-4.5 2.5-4.5-4.5z"/>
                  </svg>
                  <span>GET IT ON GOOGLE PLAY</span>
                </MagneticButton>
              </div>

              <div className="w-full relative">
                <MagneticButton 
                  variant="secondary" 
                  className="!w-full !flex !items-center !justify-center !gap-3.5 !px-6 !py-4.5 !rounded-2xl text-white font-sans font-black text-xs tracking-wider border-white/10 hover:border-brand-primary/40 hover:bg-brand-elevated"
                  href="https://share.google/TaEYXWGNY0E8ojLbO"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-brand-primary">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                  <span>GET IT VIA GOOGLE SHARE LINK</span>
                </MagneticButton>
              </div>
            </div>

            {/* Status list inside compact card */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-white/5 pt-5 text-brand-textMuted text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-brand-primary" />
                <span>Verified by Play Protect</span>
              </div>
              <div className="hidden sm:block text-white/10">•</div>
              <div className="flex items-center gap-1.5">
                <Heart size={14} className="text-brand-primary" />
                <span>100% Free & Open Source</span>
              </div>
            </div>

          </div>

        </div>

        {/* Separated Stac Engine Setup Guide */}
        <div className="w-full flex flex-col items-center border-t border-white/5 pt-16">
          
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-primary mb-3 block">Setup Guide</span>
            <h2 className="font-sans font-black text-2xl md:text-4xl text-white tracking-tight">
              How to Enable Stac Engine
            </h2>
            <p className="font-sans text-brand-textSecondary text-sm md:text-base max-w-xl mx-auto mt-3 leading-relaxed">
              Enable Birvana's modular streaming core (Stac Engine) in four simple steps to get high-fidelity music streaming.
            </p>
          </div>

          {/* Setup Steps Timeline */}
          <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            {[
              {
                step: 1,
                title: 'Open the App',
                desc: 'Launch Birvana on your Android device after installing it.',
                icon: <Play size={16} className="text-brand-primary" />
              },
              {
                step: 2,
                title: 'Go to Profile',
                desc: 'Tap the user profile icon located in the main navigation menu.',
                icon: <User size={16} className="text-brand-primary" />
              },
              {
                step: 3,
                title: 'Enable Stac Engine',
                desc: 'Toggle the "Stac Audio Engine" switch to the ON position.',
                icon: <Settings size={16} className="text-brand-primary" />
              },
              {
                step: 4,
                title: 'Then It\'s All Done!',
                desc: 'The player is fully set up and ready to stream lossless tracks.',
                icon: <ShieldCheck size={16} className="text-brand-primary" />
              }
            ].map((s) => (
              <div key={s.step} className="bg-[#090909] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:border-brand-primary/15 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                    <span className="font-mono font-black text-xs text-brand-primary">{s.step}</span>
                  </div>
                  <div className="opacity-40 text-brand-primary">{s.icon}</div>
                </div>
                <div className="space-y-1 mt-2">
                  <h4 className="font-sans font-bold text-sm text-white">{s.title}</h4>
                  <p className="font-sans text-brand-textSecondary text-xs leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
