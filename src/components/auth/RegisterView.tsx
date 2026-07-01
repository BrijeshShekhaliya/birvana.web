import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Info, ArrowRight, Loader2 } from 'lucide-react';
import type { AuthView } from './auth-types';

interface RegisterViewProps {
  setView: (view: AuthView) => void;
  onRegister: (email: string, pass: string, firstName: string, source: string) => void;
  onGoogleSignIn: () => void;
  loading: boolean;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ setView, onRegister, onGoogleSignIn, loading }) => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    
    onRegister(email, password, firstName, source);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Create an account</h2>
        <p className="text-brand-textMuted text-sm">Join Birvana to experience premium audio.</p>
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
        <span className="text-brand-textMuted text-xs font-semibold uppercase tracking-wider">or sign up with email</span>
        <div className="flex-1 h-px bg-brand-borderSubtle"></div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 font-sans">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider pl-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-textMuted" size={18} />
            <input 
              type="text" 
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-[#111] border border-brand-borderSubtle rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary transition-colors font-sans"
              placeholder="Your name"
            />
          </div>
        </div>

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
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-textMuted" size={18} />
              <input 
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-brand-borderSubtle rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary transition-colors font-sans"
                placeholder="Min 8 chars"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider pl-1">Confirm</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-textMuted" size={18} />
              <input 
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#111] border border-brand-borderSubtle rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary transition-colors font-sans"
                placeholder="Repeat password"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <label className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider pl-1">How did you hear about Birvana?</label>
          <div className="relative">
            <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-textMuted" size={18} />
            <input 
              type="text"
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-[#111] border border-brand-borderSubtle rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary transition-colors font-sans"
              placeholder="e.g. Google, friend, social media"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !email || !password || !firstName || !source}
          className="w-full bg-brand-primary text-black font-bold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition-colors disabled:opacity-50 mt-6"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              Create Account
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-brand-borderSubtle/50 flex flex-col items-center gap-3">
        <button 
          type="button"
          onClick={() => setView('login')}
          className="text-sm text-brand-textMuted hover:text-white transition-colors font-sans"
        >
          Already have an account? <span className="text-brand-primary font-semibold">Sign in</span>
        </button>
      </div>
    </motion.div>
  );
};
