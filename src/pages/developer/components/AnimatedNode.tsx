import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedNodeProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
  sublabel?: string;
}

export const AnimatedNode: React.FC<AnimatedNodeProps> = ({
  label,
  icon,
  active = false,
  size = 56,
  className = '',
  onClick,
  sublabel,
}) => {
  return (
    <motion.div
      className={`relative flex flex-col items-center gap-2 cursor-pointer select-none ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {/* Node Circle */}
      <motion.div
        className="relative flex items-center justify-center rounded-full border"
        style={{ width: size, height: size }}
        animate={{
          borderColor: active ? 'rgba(29,185,84,1)' : 'rgba(255,255,255,0.15)',
          backgroundColor: active ? 'rgba(29,185,84,0.15)' : 'rgba(255,255,255,0.04)',
          boxShadow: active
            ? '0 0 20px rgba(29,185,84,0.4), 0 0 60px rgba(29,185,84,0.1)'
            : '0 0 0px rgba(29,185,84,0)',
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {/* Pulse ring when active */}
        {active && (
          <motion.div
            className="absolute inset-0 rounded-full border border-brand-primary"
            animate={{ scale: [1, 1.5, 1.8], opacity: [0.6, 0.3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <motion.div
          animate={{ color: active ? '#1DB954' : '#AAAAAA' }}
          transition={{ duration: 0.3 }}
          className="text-xl"
        >
          {icon}
        </motion.div>
      </motion.div>

      {/* Label */}
      <motion.span
        className="font-mono text-xs tracking-widest uppercase text-center"
        animate={{ color: active ? '#1DB954' : '#666666' }}
        transition={{ duration: 0.3 }}
      >
        {label}
      </motion.span>
      {sublabel && (
        <span className="font-mono text-xs text-brand-textMuted text-center">{sublabel}</span>
      )}
    </motion.div>
  );
};
