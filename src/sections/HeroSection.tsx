import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MagneticButton } from '../components/MagneticButton';
import { AuroraBackground } from '../components/AuroraBackground';
import { ChevronDown } from 'lucide-react';

const TypingTitle: React.FC = () => {
  const sentences = [
    'Your Music, Your Sanctuary.',
    'Pure Audio, Zero Clutter.',
    'All Playlists, Unified.',
    'Immersive Visualizers.',
    'Built For Lossless Sound.'
  ];
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(90);

  useEffect(() => {
    let timer: any;
    const currentSentence = sentences[idx];

    if (isDeleting) {
      timer = setTimeout(() => {
        setText(prev => prev.slice(0, -1));
        setSpeed(45); // erase fast
      }, speed);
    } else {
      timer = setTimeout(() => {
        setText(currentSentence.slice(0, text.length + 1));
        setSpeed(80); // typing speed
      }, speed);
    }

    if (!isDeleting && text === currentSentence) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2000); // pause on full text
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setIdx(prev => (prev + 1) % sentences.length);
      setSpeed(120); // pause before next typing sequence
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, idx]);

  return (
    <span className="relative inline-block text-white">
      {text}
      <span className="inline-block w-[3px] sm:w-[4px] h-[0.8em] bg-brand-primary ml-2 animate-pulse align-middle"></span>
    </span>
  );
};

export const HeroSection: React.FC = () => {
  const handleScrollDown = () => {
    document.querySelector('#manifesto')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-[100dvh] w-full flex flex-col justify-center items-center overflow-hidden py-16 md:py-24 px-6 md:px-8 bg-brand-bg text-center">
      <AuroraBackground />

      <div className="relative max-w-[960px] w-full flex flex-col items-center z-10 pt-12">
        
        {/* Dynamic Typing Title container with a locked single-line height */}
        <div className="w-full min-h-[60px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[120px] flex items-center justify-center mb-6 py-1">
          <h1 className="font-sans font-black text-[26px] sm:text-4xl md:text-5xl lg:text-7xl tracking-tight leading-tight select-none whitespace-nowrap">
            <TypingTitle />
          </h1>
        </div>

        {/* Centered Subtitle */}
        <motion.p 
          initial={{ opacity: 0, filter: 'blur(8px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-sans text-brand-textSecondary text-sm sm:text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
        >
          Birvana is a gorgeous, gesture-driven music client for Android. Immerse yourself in an intelligent, high-fidelity player with seamless catalog integrations, smart queues, and beautiful animated elements.
        </motion.p>

        {/* Centered CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticButton 
            variant="primary" 
            href="https://play.google.com/store/apps/details?id=com.birvana.mobile"
            target="_blank"
            rel="noopener noreferrer"
            className="!flex !items-center !gap-3 !px-6"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path fill="#4285F4" d="M3.25 2.5v19l8.5-8.5-8.5-8.5z"/>
              <path fill="#EA4335" d="M3.25 2.5l8.5 8.5 4.5-4.5-10-6c-.75-.45-2-.25-3 2z"/>
              <path fill="#34A853" d="M3.25 21.5c1 1.2 2.25 1.4 3 1l10-6-4.5-4.5-8.5 9.5z"/>
              <path fill="#FBBC05" d="M11.75 11l4.5-4.5 4.5 2.5c1 .55 1 1.45 0 2l-4.5 2.5-4.5-4.5z"/>
            </svg>
            <span>Get it on Google Play</span>
          </MagneticButton>
          <MagneticButton variant="secondary" href="#download" onClick={(e: any) => {
            e.preventDefault();
            document.querySelector('#download')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Download APK
          </MagneticButton>
        </motion.div>

      </div>

      {/* Scroll Down Arrow */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        onClick={handleScrollDown}
        className="absolute bottom-6 cursor-pointer flex flex-col items-center gap-1.5 group z-10"
      >
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-brand-textMuted group-hover:text-brand-primary transition-colors duration-300">Scroll to discover</span>
        <ChevronDown size={14} className="text-brand-textMuted group-hover:text-brand-primary transition-colors duration-300 animate-bounce" />
      </motion.div>
    </section>
  );
};
