import React from 'react';
import { motion } from 'framer-motion';

export const ScreensGallerySection: React.FC = () => {
  const screenshots = [
    { src: '/screenshots/Screenshot_20260701_120025.jpg', alt: 'Home Feed' },
    { src: '/screenshots/Screenshot_20260701_120042.jpg', alt: 'Artist View' },
    { src: '/screenshots/Screenshot_20260701_120106.jpg', alt: 'Playlist Details' },
    { src: '/screenshots/Screenshot_20260701_120114.jpg', alt: 'Category Explorer' },
    { src: '/screenshots/Screenshot_20260701_120129.jpg', alt: 'Smart Search' },
    { src: '/screenshots/Screenshot_20260701_120212.jpg', alt: 'Library Management' },
    { src: '/screenshots/Screenshot_20260701_120227.jpg', alt: 'Full Player & Visualizer' }
  ];

  // Fan-out layout parameters for desktop
  const cardLayouts = [
    { x: -320, rotate: -18, z: 10 },
    { x: -210, rotate: -12, z: 20 },
    { x: -100, rotate: -6, z: 30 },
    { x: 0, rotate: 0, z: 40 }, // Center card
    { x: 100, rotate: 6, z: 30 },
    { x: 210, rotate: 12, z: 20 },
    { x: 320, rotate: 18, z: 10 }
  ];

  return (
    <section 
      id="gallery" 
      className="relative min-h-[90dvh] w-full bg-[#050505] py-24 overflow-hidden border-b border-brand-borderSubtle flex flex-col justify-center select-none"
    >
      {/* Background Spotlight gradient effect */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square opacity-30 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(29, 185, 84, 0.12) 0%, transparent 60%)'
        }}
      ></div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 w-full z-10 text-center mb-16">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-primary mb-3 block">Gallery</span>
        <h2 className="font-sans font-black text-3xl md:text-5xl text-white tracking-tight">
          Visual Interface Design
        </h2>
        <p className="font-sans text-brand-textSecondary text-sm md:text-base max-w-xl mx-auto mt-4 leading-relaxed">
          Every screen crafted to highlight what matters most — your album art and playlist curation. Clean typography, smooth transitions, premium controls.
        </p>
      </div>

      {/* Desktop 3D Fan Out Stack */}
      <div className="hidden lg:flex relative w-full h-[580px] items-center justify-center pt-8">
        <motion.div 
          initial="stacked"
          whileInView="expanded"
          viewport={{ once: true, margin: "-120px" }}
          className="relative w-full max-w-[1000px] flex items-center justify-center h-full"
        >
          {screenshots.map((screen, idx) => {
            const layout = cardLayouts[idx];
            return (
              <motion.div
                key={idx}
                variants={{
                  stacked: {
                    x: 0,
                    rotate: 0,
                    scale: 0.85,
                    opacity: 0.3
                  },
                  expanded: {
                    x: layout.x,
                    rotate: layout.rotate,
                    scale: idx === 3 ? 1 : 0.9, // Make center card slightly larger
                    opacity: 1,
                    transition: {
                      duration: 1.4,
                      ease: [0.16, 1, 0.3, 1] as const
                    }
                  }
                }}
                whileHover={{
                  y: -25,
                  rotate: 0,
                  scale: 1.02,
                  zIndex: 50,
                  boxShadow: '0 32px 64px -12px rgba(29, 185, 84, 0.25)',
                  transition: { duration: 0.3 }
                }}
                className="absolute w-[200px] aspect-[9/19.5] rounded-3xl bg-[#000] border-4 border-brand-borderStrong overflow-hidden shadow-2xl origin-bottom cursor-pointer transition-shadow"
                style={{ 
                  zIndex: layout.z,
                  boxShadow: '0 30px 60px -15px rgba(0,0,0,0.8)'
                }}
              >
                {/* Image */}
                <img 
                  src={screen.src} 
                  alt={screen.alt} 
                  className="w-full h-full object-cover select-none pointer-events-none"
                  loading="lazy"
                />
                {/* Gloss / Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Mobile / Tablet Horizontal Carousel */}
      <div className="lg:hidden w-full overflow-x-auto px-6 py-4 flex gap-6 scroll-smooth no-scrollbar">
        {screenshots.map((screen, idx) => (
          <div 
            key={idx}
            className="shrink-0 w-[220px] aspect-[9/19.5] rounded-2xl bg-black border-2 border-brand-borderStrong overflow-hidden shadow-xl"
            style={{
              boxShadow: '0 16px 32px -8px rgba(0,0,0,0.7)'
            }}
          >
            <img 
              src={screen.src} 
              alt={screen.alt} 
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
