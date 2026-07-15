import React, { useState, useEffect } from 'react';
import { Download, ChevronDown, ChevronUp, FileCode2, Calendar, HardDrive, CheckCircle2 } from 'lucide-react';
import { MagneticButton } from '../components/MagneticButton';
import { supabase } from '../lib/supabase';

interface ReleaseData {
  version: string;
  buildNumber: number;
  date: string;
  channel: string;
  size: string;
  url: string;
  sha256: string;
  notes: string[];
}

export const DownloadSection: React.FC = () => {
  const [release, setRelease] = useState<ReleaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotesOpen, setIsNotesOpen] = useState(true);

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        // 1. Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('app_releases')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setRelease({
            version: data.version,
            buildNumber: data.build_number,
            date: data.date,
            channel: data.channel,
            size: data.size,
            url: data.url,
            sha256: data.sha256 || '',
            notes: data.notes || []
          });
          setIsLoading(false);
          return;
        }

        // 2. Fallback to static releases.json if table is empty
        const res = await fetch('/releases.json');
        if (!res.ok) throw new Error("Local releases.json not found");
        const localData = await res.json();
        setRelease(localData.latest);
        setIsLoading(false);
      } catch (err) {
        console.warn("Failed to fetch release from Supabase, trying static releases.json:", err);
        
        // 3. Last fallback (hardcoded defaults)
        fetch('/releases.json')
          .then(res => res.json())
          .then(localData => {
            setRelease(localData.latest);
            setIsLoading(false);
          })
          .catch(fallbackErr => {
            console.error("Failed to load local releases.json fallback:", fallbackErr);
            setRelease({
              version: "1.0.0",
              buildNumber: 1,
              date: "2025-06-30",
              channel: "stable",
              size: "58.5 MB",
              url: "/downloads/birvana.apk",
              sha256: "d50a7d9bb8c49e29a32c7104b2c1cd51a66a6a24687b37db8751ea9bbd6be1a5",
              notes: [
                "Initial release of Birvana",
                "Stunning home screen with music discovery & personal recommendations",
                "Blazing fast unified search supporting JioSaavn integration",
                "Feature-rich library to manage tracks, playlists, and favorites",
                "Advanced music player with dynamic, interactive visualizer",
                "Under-the-hood performance optimizations powered by Stac Engine AI"
              ]
            });
            setIsLoading(false);
          });
      }
    };

    fetchLatestRelease();
  }, []);

  if (isLoading || !release) {
    return (
      <section id="download" className="relative min-h-[60dvh] w-full bg-brand-bg py-24 flex items-center justify-center border-b border-brand-borderSubtle">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin"></div>
      </section>
    );
  }

  return (
    <section 
      id="download" 
      className="relative min-h-[85dvh] w-full bg-brand-bg py-24 px-6 md:px-8 border-b border-brand-borderSubtle flex flex-col justify-center select-none"
    >
      {/* Background soft glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[35%] bg-brand-primary/5 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="max-w-[800px] mx-auto w-full z-10">
        
        {/* Section Title */}
        <div className="text-center mb-16">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-primary mb-3 block">Get the App</span>
          <h2 className="font-sans font-black text-3xl md:text-5xl text-white tracking-tight">
            Install Birvana
          </h2>
          <p className="font-sans text-brand-textSecondary text-sm md:text-base max-w-lg mx-auto mt-4 leading-relaxed">
            Download the official Android package (.apk) directly onto your mobile device and experience pure high-fidelity audio today.
          </p>
        </div>

        {/* Primary Download Card Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Card 1: Play Store (Primary) */}
          <div className="bg-brand-card border border-brand-primary/20 rounded-3xl p-6 md:p-8 flex flex-col justify-between gap-6 shadow-2xl relative overflow-hidden group">
            {/* subtle glow border */}
            <div className="absolute inset-0 border border-brand-primary/10 rounded-3xl pointer-events-none group-hover:border-brand-primary/35 transition-colors duration-500"></div>
            
            <div className="text-left space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-primary font-bold">Recommended</span>
              <h3 className="font-sans font-black text-2xl text-white">Google Play Store</h3>
              <p className="font-sans text-brand-textSecondary text-sm leading-relaxed">
                Install the verified store version to receive automatic app updates and full cloud features seamlessly.
              </p>
            </div>

            <div className="flex justify-start">
              <MagneticButton 
                variant="primary" 
                className="!w-full !flex !items-center !justify-center !gap-3 !px-6 !py-4" 
                href="https://play.google.com/store/apps/details?id=com.birvana.mobile"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <path fill="#4285F4" d="M3.25 2.5v19l8.5-8.5-8.5-8.5z"/>
                  <path fill="#EA4335" d="M3.25 2.5l8.5 8.5 4.5-4.5-10-6c-.75-.45-2-.25-3 2z"/>
                  <path fill="#34A853" d="M3.25 21.5c1 1.2 2.25 1.4 3 1l10-6-4.5-4.5-8.5 9.5z"/>
                  <path fill="#FBBC05" d="M11.75 11l4.5-4.5 4.5 2.5c1 .55 1 1.45 0 2l-4.5 2.5-4.5-4.5z"/>
                </svg>
                <span>Get it on Google Play</span>
              </MagneticButton>
            </div>
          </div>

          {/* Card 2: Direct Installer (APK) */}
          <div className="bg-[#090909] border border-brand-borderSubtle rounded-3xl p-6 md:p-8 flex flex-col justify-between gap-6 shadow-2xl relative overflow-hidden group">
            {/* subtle glow border */}
            <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none group-hover:border-white/10 transition-colors duration-500"></div>
            
            <div className="text-left space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-textMuted font-bold">Standalone</span>
              <h3 className="font-sans font-black text-2xl text-white">Direct APK Package</h3>
              <p className="font-sans text-brand-textSecondary text-sm leading-relaxed">
                Download the standalone package installer (.apk) directly for manual installation on your device.
              </p>
              
              <div className="flex gap-4 font-mono text-[11px] text-brand-textMuted pt-2">
                <span>Date: {release.date}</span>
                <span>Size: {release.size}</span>
              </div>
            </div>

            <div className="flex justify-start">
              <a 
                href={release.url}
                download="birvana.apk"
                className="w-full text-center bg-[#111] hover:bg-white border border-brand-borderSubtle hover:border-transparent text-white hover:text-black font-sans font-bold text-sm py-4.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <Download size={15} />
                <span>Download Standalone APK</span>
              </a>
            </div>
          </div>

        </div>

        {/* Release Notes Collapsible */}
        <div className="border border-brand-borderSubtle bg-brand-bg/40 rounded-2xl overflow-hidden shadow-xl text-left">
          <button 
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className="w-full flex items-center justify-between p-5 font-sans font-bold text-sm text-white hover:bg-brand-elevated transition-colors duration-300"
          >
            <span>What's New in Version {release.version}</span>
            {isNotesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isNotesOpen && (
            <div className="p-6 border-t border-brand-borderSubtle bg-brand-card/25 flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                {release.notes.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 size={15} className="text-brand-primary mt-0.5 shrink-0" />
                    <span className="font-sans text-brand-textSecondary text-sm leading-relaxed">
                      {note}
                    </span>
                  </div>
                ))}
              </div>

              {/* Technical Hash */}
              <div className="pt-4 border-t border-brand-borderSubtle flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-[10px] text-brand-textMuted">
                <span>SHA-256 Checksum</span>
                <span className="bg-brand-elevated px-2.5 py-1 rounded border border-brand-borderSubtle select-all font-mono break-all md:break-normal text-right">
                  {release.sha256}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
