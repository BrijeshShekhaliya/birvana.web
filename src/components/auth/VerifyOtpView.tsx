import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import type { AuthView } from './auth-types';

interface VerifyOtpViewProps {
  setView: (view: AuthView) => void;
  onVerify: (otp: string) => void;
  email: string;
  loading: boolean;
}

export const VerifyOtpView: React.FC<VerifyOtpViewProps> = ({ setView, onVerify, email, loading }) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(otp);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-brand-textMuted text-sm">
          We sent a 6-digit code to <span className="text-white font-medium">{email}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider pl-1">Security Code</label>
          <input 
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full bg-[#111] border border-brand-borderSubtle rounded-xl py-4 px-4 text-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-brand-primary transition-colors font-mono"
            placeholder="000000"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || otp.length !== 6}
          className="w-full bg-white text-black font-semibold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 mt-6"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              Verify Code
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 flex justify-center">
        <button 
          type="button"
          onClick={() => setView('welcome')}
          className="text-sm text-brand-textMuted hover:text-brand-primary transition-colors font-sans"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
};
