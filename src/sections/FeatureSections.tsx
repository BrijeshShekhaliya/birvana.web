import React from 'react';
import { motion } from 'framer-motion';
import { PhoneFrame } from '../components/PhoneFrame';
import { Compass, Search, FolderHeart, Music4 } from 'lucide-react';

interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bullets: string[];
  screenshot: string;
}

export const FeatureSections: React.FC = () => {
  const features: FeatureItem[] = [
    {
      id: 'discovery',
      title: 'Smart Music Discovery',
      subtitle: 'Uncover new tracks with an intelligent engine that knows your taste.',
      icon: <Compass className="text-brand-primary" size={24} />,
      bullets: [
        'Curated feeds adapting dynamically to your daily listening moods.',
        'Artist profile details with smooth transitions and full discography view.',
        'Seamless integration with high-quality online catalogs like JioSaavn.'
      ],
      screenshot: '/screenshots/Screenshot_20260701_120025.jpg'
    },
    {
      id: 'search',
      title: 'Unified Search',
      subtitle: 'Query across multiple music databases simultaneously in real-time.',
      icon: <Search className="text-brand-primary" size={24} />,
      bullets: [
        'Zero-latency query suggestions that autocomplete instantly.',
        'Filters for tracks, artists, playlists, and user-installed extension sources.',
        'Save searches and query history directly in-app.'
      ],
      screenshot: '/screenshots/Screenshot_20260701_120129.jpg'
    },
    {
      id: 'library',
      title: 'Personalized Library',
      subtitle: 'Your collection, organized elegantly and accessible offline.',
      icon: <FolderHeart className="text-brand-primary" size={24} />,
      bullets: [
        'Easily build custom playlists with track ordering and smart duplicates removal.',
        'High fidelity local playback with support for FLAC, WAV, and MP3 formats.',
        'Clean metadata editor to correct tags, album artwork, and genres.'
      ],
      screenshot: '/screenshots/Screenshot_20260701_120212.jpg'
    },
    {
      id: 'player',
      title: 'Cinematic Player',
      subtitle: 'An immersive full-screen audio player with interactive elements.',
      icon: <Music4 className="text-brand-primary" size={24} />,
      bullets: [
        'GPU-accelerated sound wave visualizers that pulse to the audio frequencies.',
        'Dynamic color-matching background gradients syncing to the album cover colors.',
        'Swipe controls for quick queue queuing and double-tap to favor.'
      ],
      screenshot: '/screenshots/Screenshot_20260701_120227.jpg'
    }
  ];

  return (
    <section 
      id="features" 
      className="relative w-full bg-brand-bg border-b border-brand-borderSubtle select-none overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24 flex flex-col gap-16 md:gap-28">
        {features.map((feature, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div 
              key={feature.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
            >
              {/* Text Column */}
              <div 
                className={`lg:col-span-7 flex flex-col justify-center text-center lg:text-left items-center lg:items-start ${
                  isEven ? 'lg:order-1' : 'lg:order-2'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-brand-elevated border border-brand-borderSubtle">
                    {feature.icon}
                  </div>
                  <span className="font-mono text-xs uppercase tracking-widest text-brand-textMuted">Feature 0{idx + 1}</span>
                </div>
                
                <h2 className="font-sans font-black text-3xl md:text-4xl text-white mb-4 tracking-tight leading-tight">
                  {feature.title}
                </h2>
                
                <p className="font-sans text-brand-textSecondary text-base md:text-lg leading-relaxed mb-6 max-w-xl">
                  {feature.subtitle}
                </p>

                <ul className="space-y-4 max-w-lg">
                  {feature.bullets.map((bullet, bIdx) => (
                    <motion.li 
                      key={bIdx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: bIdx * 0.1, duration: 0.5 }}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0"></span>
                      <span className="font-sans text-brand-textSecondary text-sm md:text-base leading-relaxed">
                        {bullet}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Phone Mockup Column */}
              <div 
                className={`lg:col-span-5 flex justify-center items-center ${
                  isEven ? 'lg:order-2' : 'lg:order-1'
                }`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
                  className="relative w-full flex justify-center"
                >
                  <div className="absolute w-[260px] md:w-[280px] lg:w-[300px] aspect-[9/19.5] bg-brand-primary/5 rounded-[42px] blur-[80px] pointer-events-none scale-90 z-0"></div>
                  <div className="z-10">
                    <PhoneFrame 
                      src={feature.screenshot} 
                      alt={feature.title} 
                      showReflection={true}
                    />
                  </div>
                </motion.div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
