import React from 'react';

interface PhoneFrameProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  showReflection?: boolean;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  src,
  alt,
  className = '',
  style = {},
  showReflection = true,
}) => {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`} style={style}>
      {/* Phone container */}
      <div 
        className="relative mx-auto bg-brand-elevated border-[10px] border-brand-borderStrong rounded-[42px] shadow-2xl overflow-hidden aspect-[9/19.5] w-[260px] md:w-[280px] lg:w-[300px] transition-all duration-300"
        style={{
          boxShadow: '0 48px 96px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Screen Bezel shadow */}
        <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/5 pointer-events-none z-30"></div>
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-brand-borderStrong rounded-b-[16px] z-25 flex items-end justify-center pb-1">
          <div className="w-10 h-1 bg-black rounded-full"></div>
        </div>

        {/* Screen Content */}
        <div className="w-full h-full bg-black overflow-hidden relative">
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="lazy"
          />
          
          {/* Glass shine overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20"></div>
        </div>
      </div>

      {/* Reflection */}
      {showReflection && (
        <div 
          className="absolute top-[102%] w-[260px] md:w-[280px] lg:w-[300px] aspect-[9/19.5] opacity-25 pointer-events-none select-none overflow-hidden scale-y-[-1] origin-top blur-[2px]"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 35%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 35%)',
          }}
        >
          <div className="relative w-full h-full border-[10px] border-brand-borderStrong rounded-[42px]">
            <img 
              src={src} 
              alt="" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      )}
    </div>
  );
};
