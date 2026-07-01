import React, { useRef } from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  style?: React.CSSProperties;
}

/**
 * Lightweight GlassPanel — CSS-only tilt via custom properties.
 * Previous version used useMotionValue + useSpring + useTransform per instance
 * which cost ~6 motion value subscriptions × 20 panels = 120 active MotionValues.
 * This version does pure CSS transforms on the DOM node directly (zero JS overhead
 * during scroll/animation, only runs on mouseenter/move/leave).
 */
export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  glowColor = 'rgba(29,185,84,0.15)',
  style,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 to +0.5
    const ny = (e.clientY - rect.top)  / rect.height - 0.5;

    el.style.transform = `perspective(800px) rotateX(${-ny * 8}deg) rotateY(${nx * 8}deg)`;
    el.style.transition = 'none';
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
    el.style.transition = 'transform 0.45s cubic-bezier(0.16,1,0.3,1)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass-panel-root relative rounded-2xl border border-white/10 overflow-hidden ${className}`}
      style={{
        willChange: 'transform',
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {/* Glass background — no backdrop-blur (GPU expensive), use solid dark bg */}
      <div className="absolute inset-0" style={{ background: 'rgba(12,12,12,0.82)' }} />
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {/* CSS glow on hover — no JS */}
      <div
        className="glass-panel-glow absolute inset-0 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-300"
        style={{ boxShadow: `0 0 40px ${glowColor} inset, 0 0 40px ${glowColor}` }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
