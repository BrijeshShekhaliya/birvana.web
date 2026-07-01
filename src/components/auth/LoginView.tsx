import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import type { AuthView } from './auth-types';

interface LoginViewProps {
  setView: (view: AuthView) => void;
  onLoginPassword: (email: string, pass: string) => void;
  onGoogleSignIn: () => void;
  loading: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ setView, onLoginPassword, onGoogleSignIn, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginPassword(email, password);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-brand-textMuted text-sm">Sign in to sync your high-fidelity music.</p>
      </div>

      <button 
        type="button"
        onClick={onGoogleSignIn}
        disabled={loading}
        className="w-full bg-white text-black font-semibold rounded-xl py-3 flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors disabled:opacity-50 mb-6"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
        Continue with Google
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-brand-borderSubtle"></div>
        <span className="text-brand-textMuted text-xs font-semibold uppercase tracking-wider">or continue with email</span>
        <div className="flex-1 h-px bg-brand-borderSubtle"></div>
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

        <div className="space-y-1">
          <div className="flex justify-between items-center pr-1">
            <label className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider pl-1">Password</label>
            <button 
              type="button"
              onClick={() => setView('login-otp')}
              className="text-xs text-brand-primary hover:text-white transition-colors"
            >
              Use OTP instead
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-textMuted" size={18} />
            <input 
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111] border border-brand-borderSubtle rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary transition-colors font-sans"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-brand-primary text-black font-bold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition-colors disabled:opacity-50 mt-6"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              Sign In
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-4 border-t border-brand-borderSubtle/50 flex flex-col items-center gap-3">
        <button 
          type="button"
          onClick={() => setView('register')}
          className="text-sm text-brand-textMuted hover:text-white transition-colors font-sans"
        >
          Don't have an account? <span className="text-brand-primary font-semibold">Sign up</span>
        </button>
      </div>
    </motion.div>
  );
};
