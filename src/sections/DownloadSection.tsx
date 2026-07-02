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
              size: "110.8 MB",
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

        {/* Primary Download Card */}
        <div className="bg-brand-card border border-brand-borderSubtle rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 mb-12 shadow-2xl relative overflow-hidden group">
          {/* subtle glow border */}
          <div className="absolute inset-0 border border-brand-primary/10 rounded-3xl pointer-events-none group-hover:border-brand-primary/25 transition-colors duration-500"></div>

          {/* Technical Specs columns */}
          <div className="flex flex-col gap-4 w-full md:w-auto text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="font-sans font-black text-2xl text-white">Birvana for Android</span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/25 self-start sm:self-auto">
                v{release.version}
              </span>
            </div>

            <div className="grid grid-cols-2 md:flex md:items-center gap-x-6 gap-y-2.5 font-mono text-xs text-brand-textSecondary">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-brand-textMuted" />
                <span>{release.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HardDrive size={13} className="text-brand-textMuted" />
                <span>{release.size}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2 md:col-span-1">
                <FileCode2 size={13} className="text-brand-textMuted" />
                <span>{release.channel} build</span>
              </div>
            </div>
          </div>

          {/* Primary Action CTA */}
          <div className="shrink-0 w-full md:w-auto flex justify-center">
            <MagneticButton 
              variant="primary" 
              className="!w-full md:!w-auto !flex !items-center !justify-center !gap-3 !px-8 !py-4.5" 
              href={release.url}
              download="birvana.apk"
            >
              <Download size={16} />
              <span>Download APK</span>
            </MagneticButton>
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
