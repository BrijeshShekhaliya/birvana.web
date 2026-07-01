import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import type { AuthView } from './auth-types';

interface OtpLoginViewProps {
  setView: (view: AuthView) => void;
  onRequestOtp: (email: string) => void;
  loading: boolean;
}

export const OtpLoginView: React.FC<OtpLoginViewProps> = ({ setView, onRequestOtp, loading }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestOtp(email);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Sign in with OTP</h2>
        <p className="text-brand-textMuted text-sm">We'll send a 6-digit code to your email.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider pl-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-textMuted" size={18} />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111] border border-brand-borderSubtle rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary transition-colors font-sans"
              placeholder="audiophile@example.com"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !email}
          className="w-full bg-white text-black font-semibold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 mt-6"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              Send Code
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 flex justify-center">
        <button 
          type="button"
          onClick={() => setView('login')}
          className="text-sm text-brand-textMuted hover:text-brand-primary transition-colors font-sans"
        >
          Back to password login
        </button>
      </div>
    </motion.div>
  );
};
