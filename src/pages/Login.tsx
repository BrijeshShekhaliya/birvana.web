import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';

import { LoginView } from '../components/auth/LoginView';
import { OtpLoginView } from '../components/auth/OtpLoginView';
import { RegisterView } from '../components/auth/RegisterView';
import { VerifyOtpView } from '../components/auth/VerifyOtpView';
import type { AuthFlowState, AuthView } from '../components/auth/auth-types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  
  const [state, setState] = useState<AuthFlowState>({
    view: 'login',
    email: '',
    error: null,
    message: null,
    loading: false,
    otpType: 'email'
  });

  const updateState = (updates: Partial<AuthFlowState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const setView = (view: AuthView) => updateState({ view, error: null, message: null });

  // HANDLERS
  const handleGoogleSignIn = async () => {
    updateState({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Explicitly redirect to the profile page to avoid fallback issues
          redirectTo: `${window.location.origin}/profile`
        }
      });
      if (error) throw error;
      // Redirect happens automatically
    } catch (err: any) {
      updateState({ error: err.message, loading: false });
    }
  };

  const handleLoginPassword = async (email: string, pass: string) => {
    updateState({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
      navigate('/profile');
    } catch (err: any) {
      updateState({ error: err.message, loading: false });
    }
  };

  const handleRequestOtp = async (email: string) => {
    updateState({ loading: true, error: null, email, otpType: 'email' });
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });
      if (error) throw error;
      updateState({ 
        view: 'verify-otp', 
        message: 'OTP sent successfully!', 
        loading: false 
      });
    } catch (err: any) {
      updateState({ error: err.message, loading: false });
    }
  };

  const handleRegister = async (email: string, pass: string, firstName: string, source: string) => {
    updateState({ loading: true, error: null, email, password: pass, firstName, source });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            first_name: firstName,
            where_heard: source,
          }
        }
      });
      if (error) throw error;

      // Supabase returns an empty identities array if the email already exists
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error('This email address is already registered. Please sign in instead.');
      }

      updateState({ 
        view: 'verify-otp', 
        otpType: 'signup',
        message: 'Registration successful! Please verify your email.', 
        loading: false 
      });
    } catch (err: any) {
      updateState({ error: err.message, loading: false });
    }
  };

  const handleVerifyOtp = async (token: string) => {
    updateState({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: state.email,
        token,
        type: state.otpType,
      });
      if (error) throw error;
      navigate('/profile');
    } catch (err: any) {
      updateState({ error: err.message, loading: false });
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col relative overflow-hidden selection:bg-brand-primary/30">
      <Navigation />
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="flex-1 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start px-6 pt-24 lg:pt-40 pb-16 relative z-10">
        
        {/* Info Side (Hidden on Mobile) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col pt-8"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-6 w-max">
            Birvana Cloud
          </div>
          <h2 className="text-4xl xl:text-5xl font-black text-white font-sans tracking-tight mb-6 leading-tight">
            Your audio universe, <br/>
            <span className="text-brand-primary">seamlessly synced.</span>
          </h2>
          <p className="text-brand-textSecondary text-lg font-sans mb-8 max-w-md leading-relaxed">
            Create an account to synchronize your custom playlists, liked songs, and playback preferences across all your devices instantly. Experience premium playback without boundaries.
          </p>
          <div className="flex gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sm font-semibold text-brand-textMuted font-sans">Cross-platform</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sm font-semibold text-brand-textMuted font-sans">High-fidelity</span>
            </div>
          </div>
        </motion.div>

        {/* Login Box Side */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto bg-[#0A0A0A] border border-brand-borderSubtle rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[540px] flex flex-col"
        >
          <div className="flex justify-center mb-8 shrink-0">
            <img 
              src="/assets/birvana-mark.png" 
              alt="Birvana Logo" 
              className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            />
          </div>

          <AnimatePresence mode="wait">
            {state.error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6 font-sans shrink-0"
              >
                {state.error}
              </motion.div>
            )}

            {state.message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm p-3 rounded-lg mb-6 font-sans shrink-0"
              >
                {state.message}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              {state.view === 'login' && (
                <LoginView 
                  key="login"
                  setView={setView} 
                  onLoginPassword={handleLoginPassword} 
                  onGoogleSignIn={handleGoogleSignIn}
                  loading={state.loading} 
                />
              )}

              {state.view === 'login-otp' && (
                <OtpLoginView 
                  key="login-otp"
                  setView={setView} 
                  onRequestOtp={handleRequestOtp} 
                  loading={state.loading} 
                />
              )}

              {state.view === 'register' && (
                <RegisterView 
                  key="register"
                  setView={setView} 
                  onRegister={handleRegister} 
                  onGoogleSignIn={handleGoogleSignIn}
                  loading={state.loading}
                />
              )}

              {state.view === 'verify-otp' && (
                <VerifyOtpView 
                  key="verify-otp"
                  setView={setView} 
                  onVerify={handleVerifyOtp} 
                  email={state.email} 
                  loading={state.loading} 
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};
