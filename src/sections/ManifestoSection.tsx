import React from 'react';
import { motion } from 'framer-motion';

export const ManifestoSection: React.FC = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.18
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  return (
    <section 
      id="manifesto" 
      className="relative min-h-[70dvh] w-full flex flex-col justify-center items-center py-20 md:py-28 px-6 md:px-8 bg-[#0a0a0a] border-y border-brand-borderSubtle overflow-hidden select-none"
    >
      {/* Background design matrix/grid */}
      <div 
        className="absolute inset-0 opacity-25" 
        style={{
          backgroundImage: `linear-gradient(to right, #1F1F1F 1px, transparent 1px), linear-gradient(to bottom, #1F1F1F 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 90%)',
        }}
      ></div>

      <div className="relative max-w-[850px] text-center z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col gap-8"
        >
          {/* Manifesto Header */}
          <motion.h2 
            variants={itemVariants} 
            className="font-sans font-black text-3xl md:text-5xl text-white tracking-tight leading-tight"
          >
            We believe music is{' '}
            <span className="text-brand-primary relative inline-block">
              personal.
              <span className="absolute bottom-1 md:bottom-2 left-0 right-0 h-1 bg-brand-primary/20 -z-10 rounded-full"></span>
            </span>
          </motion.h2>
          
          {/* Main Statement */}
          <motion.p 
            variants={itemVariants}
            className="font-sans font-medium text-lg md:text-xl lg:text-2xl text-brand-textSecondary leading-relaxed max-w-3xl mx-auto"
          >
            It shouldn't be cluttered with visual noise, annoying recommendations, or invasive popups. Your player should be a sanctuary.
          </motion.p>
          
          {/* Subtext Paragraph */}
          <motion.p 
            variants={itemVariants}
            className="font-sans text-xs md:text-sm lg:text-base text-brand-textMuted leading-relaxed max-w-2xl mx-auto"
          >
            Birvana was built for audiophiles and design purists who want to reconnect with their libraries. It wraps powerful unified streaming engines, custom Equalizers, and beautiful dynamic UI layouts in a package that stays out of the way of your sound.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};
