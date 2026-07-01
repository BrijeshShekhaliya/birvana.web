import React from 'react';
import { Link } from 'react-router-dom';

import { Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#030303] border-t border-brand-borderSubtle py-12 md:py-16 text-brand-textMuted select-none">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img 
            src="/assets/birvana-mark.png" 
            alt="Birvana Logo" 
            className="w-6 h-6 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
          />
          <span className="font-sans font-semibold text-sm tracking-wide text-brand-textSecondary">
            Birvana Music App
          </span>
        </div>

        {/* Copy */}
        <div className="font-sans text-xs text-center md:text-left order-3 md:order-2">
          &copy; {currentYear} Birvana. All rights reserved. Made for premium music playback.
        </div>

        {/* Social / Links */}
        <div className="flex flex-col sm:flex-row items-center gap-6 font-sans text-xs order-2 md:order-3">
          <a 
            href="mailto:birvana.official.in@gmail.com"
            className="flex items-center gap-2 hover:text-brand-textSecondary transition-colors duration-300"
            title="Click to send email or copy address"
          >
            <Mail size={14} className="opacity-70" />
            <span>birvana.official.in@gmail.com</span>
          </a>
          
          <a 
            href="https://github.com/BrijeshShekhaliya" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-brand-textSecondary transition-colors duration-300"
          >
            <span>GitHub</span>
          </a>

          <Link 
            to="/privacy" 
            className="hover:text-brand-textSecondary transition-colors duration-300"
          >
            Privacy Policy
          </Link>
        </div>

      </div>
    </footer>
  );
};
