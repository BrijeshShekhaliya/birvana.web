import React from 'react';

export const AuroraBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#070707]">
      {/* Radial ambient glow */}
      <div 
        className="absolute inset-0 opacity-30" 
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(29, 185, 84, 0.15) 0%, transparent 60%)'
        }}
      ></div>
      
      {/* Blobs container */}
      <div className="absolute inset-0 filter blur-[120px] opacity-25">
        {/* Green Accent Blob 1 */}
        <div 
          className="absolute -top-[10%] -left-[10%] w-[60vw] aspect-square rounded-full bg-brand-primary animate-aurora-slow"
          style={{
            animationDuration: '25s'
          }}
        ></div>

        {/* Deep Green Dim Blob 2 */}
        <div 
          className="absolute top-[20%] -right-[15%] w-[50vw] aspect-square rounded-full bg-brand-accentDim animate-aurora-slow"
          style={{
            animationDuration: '30s',
            animationDelay: '-8s'
          }}
        ></div>

        {/* Soft Green Glow Blob 3 */}
        <div 
          className="absolute -bottom-[20%] left-[10%] w-[55vw] aspect-square rounded-full bg-brand-primary/80 animate-aurora-slow"
          style={{
            animationDuration: '22s',
            animationDelay: '-15s'
          }}
        ></div>
      </div>
      
      {/* Overlay to ensure dark, immersive contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-bg/50 to-brand-bg"></div>
    </div>
  );
};
