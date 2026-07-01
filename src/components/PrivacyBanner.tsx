import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const COOKIE_KEY = 'birvana_privacy_accepted';

export const PrivacyBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(COOKIE_KEY)) {
        // Small delay so it doesn't flash before first paint
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage blocked (private mode etc.) — just show it
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(COOKIE_KEY, '1'); } catch { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="privacy-banner fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-between gap-4 px-6 py-4 md:px-10"
      style={{
        background: 'rgba(6,6,6,0.92)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        animation: 'privacySlideUp 0.45s cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      <p className="font-mono text-[11px] text-white/60 leading-relaxed max-w-2xl">
        We use cookies and local storage to save your preferences and improve your experience on Birvana.
        By continuing to use this site you accept our{' '}
        <Link
          to="/privacy"
          className="text-[#1DB954] underline underline-offset-2 hover:text-white transition-colors"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={accept}
          className="font-mono text-xs px-5 py-2.5 rounded-full text-black bg-[#1DB954] hover:bg-[#1ed760] transition-colors font-semibold"
        >
          Accept
        </button>
        <button
          onClick={accept}
          className="font-mono text-xs px-4 py-2.5 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors"
        >
          Dismiss
        </button>
      </div>

      <style>{`
        @keyframes privacySlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};
