import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: (e: React.MouseEvent<any>) => void;
  className?: string;
  href?: string;
  download?: boolean | string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  className = '',
  href,
  download,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    
    // Magnetic pull strength factors: x * 0.3, y * 0.3
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const buttonClasses = `
    relative inline-flex items-center justify-center font-semibold rounded-full select-none
    transition-all duration-300 text-xs md:text-sm tracking-wider uppercase px-6 md:px-8 py-3.5 md:py-4
    focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-bg
    ${variant === 'primary'
      ? 'bg-brand-primary text-black hover:shadow-[0_0_24px_rgba(29,185,84,0.35)] border border-transparent'
      : 'bg-transparent text-white border border-brand-borderStrong hover:bg-brand-elevated hover:border-white/35'
    }
    ${className}
  `;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring' as const, stiffness: 160, damping: 15, mass: 0.1 }}
      className="inline-block"
    >
      {href ? (
        <a 
          href={href} 
          download={download} 
          className={buttonClasses} 
          onClick={onClick}
        >
          {children}
        </a>
      ) : (
        <button className={buttonClasses} onClick={onClick}>
          {children}
        </button>
      )}
    </motion.div>
  );
};
