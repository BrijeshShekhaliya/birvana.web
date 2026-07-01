import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import type { Session } from '@supabase/supabase-js';

import { LoginView } from '../components/auth/LoginView';
import { OtpLoginView } from '../components/auth/OtpLoginView';
import { VerifyOtpView } from '../components/auth/VerifyOtpView';
import type { AuthFlowState, AuthView } from '../components/auth/auth-types';
import { AlertTriangle, Loader2, CheckCircle } from 'lucide-react';

export const DeleteAccount: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Auth orchestration state for when user is not logged in
  const [authState, setAuthState] = useState<AuthFlowState>({
    view: 'login',
    email: '',
    error: null,
    message: 'Please sign in to proceed with account deletion.',
    loading: false,
    otpType: 'email'
  });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Detect if this is a newly created account from Google OAuth
        const created = new Date(session.user.created_at).getTime();
        const lastSignIn = session.user.last_sign_in_at 
          ? new Date(session.user.last_sign_in_at).getTime()
          : created;
        
        const isNewUser = Math.abs(lastSignIn - created) < 5000; // created within 5s of sign in
        
        if (isNewUser) {
          // Immediately clean up the newly created user and reject
          await supabase.rpc('delete_user');
          await supabase.auth.signOut();
          setSession(null);
          updateAuthState({ 
            error: 'This Google account is not registered. You cannot delete an account that does not exist.' 
          });
        } else {
          setSession(session);
        }
      } else {
        setSession(null);
      }
      setCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Detect if this is a newly created account from Google OAuth
        const created = new Date(session.user.created_at).getTime();
        const lastSignIn = session.user.last_sign_in_at 
          ? new Date(session.user.last_sign_in_at).getTime()
          : created;
        
        const isNewUser = Math.abs(lastSignIn - created) < 5000;
        
        if (isNewUser) {
          await supabase.rpc('delete_user');
          await supabase.auth.signOut();
          setSession(null);
          updateAuthState({ 
            error: 'This Google account is not registered. You cannot delete an account that does not exist.' 
          });
        } else {
          setSession(session);
        }
      } else {
        setSession(null);
      }
      setCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateAuthState = (updates: Partial<AuthFlowState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  };

  const setAuthView = (view: AuthView) => updateState({ view, error: null });

  // Expose updateState locally for setAuthView to work correctly
  const updateState = updateAuthState;

  // HANDLERS FOR AUTH
  const handleGoogleSignIn = async () => {
    updateAuthState({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirect back to this page for deletion confirmation
          redirectTo: `${window.location.origin}/delete`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      updateAuthState({ error: err.message, loading: false });
    }
  };

  const handleLoginPassword = async (email: string, pass: string) => {
    updateAuthState({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
      // Session hook will trigger state change
    } catch (err: any) {
      updateAuthState({ error: err.message, loading: false });
    }
  };

  const handleRequestOtp = async (email: string) => {
    updateAuthState({ loading: true, error: null, email, otpType: 'email' });
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false // Prevent creating a new user if it doesn't exist
        }
      });
      if (error) throw error;
      updateAuthState({ 
        view: 'verify-otp', 
        message: 'OTP sent successfully!', 
        loading: false 
      });
    } catch (err: any) {
      updateAuthState({ error: err.message, loading: false });
    }
  };

  const handleVerifyOtp = async (token: string) => {
    updateAuthState({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: authState.email,
        token,
        type: authState.otpType,
      });
      if (error) throw error;
    } catch (err: any) {
      updateAuthState({ error: err.message, loading: false });
    }
  };

  const handleDeleteProfile = async () => {
    if (deleteConfirmEmail !== session?.user.email) {
      updateAuthState({ error: 'Email does not match.' });
      return;
    }

    setIsDeleting(true);
    updateAuthState({ error: null });

    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;

      await supabase.auth.signOut();
      setDeleteSuccess(true);
      setIsDeleting(false);
    } catch (err: any) {
      updateAuthState({ error: err.message || 'Failed to delete account. Please try again.', loading: false });
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col relative overflow-hidden selection:bg-brand-primary/30">
      <Navigation />
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="flex-1 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start px-6 pt-24 lg:pt-40 pb-16 relative z-10">
        
        {/* Left Info Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col pt-8"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-bold tracking-widest uppercase mb-6 w-max">
            Danger Zone
          </div>
          <h2 className="text-4xl xl:text-5xl font-black text-white font-sans tracking-tight mb-6 leading-tight">
            Account Deletion <br/>
            <span className="text-red-500">Request Hub.</span>
          </h2>
          <p className="text-brand-textSecondary text-lg font-sans mb-8 max-w-md leading-relaxed">
            You are initiating a permanent account deletion. All synced library data, playlists, and settings will be permanently destroyed.
          </p>
        </motion.div>

        {/* Right Form Box */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto bg-[#0A0A0A] border border-brand-borderSubtle rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-center"
        >
          {checkingAuth ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
            </div>
          ) : deleteSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center">
                <CheckCircle size={64} className="text-brand-primary" />
              </div>
              <h1 className="text-2xl font-black text-white">Account Deleted</h1>
              <p className="text-brand-textMuted text-sm font-sans leading-relaxed">
                Your Birvana account and all associated data have been permanently removed. Thank you for using Birvana.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="w-full bg-white text-black font-semibold rounded-xl py-3 hover:bg-gray-200 transition-colors"
              >
                Go to Homepage
              </button>
            </motion.div>
          ) : session ? (
            // CONFIRM DELETION STEP
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-center mb-4 shrink-0">
                <AlertTriangle size={64} className="text-red-500 animate-pulse" />
              </div>

              <div className="text-center">
                <h1 className="text-2xl font-black text-white">Confirm Deletion</h1>
                <p className="text-brand-textMuted text-sm font-sans mt-2">
                  You are logged in as <strong className="text-white">{session.user.email}</strong>.
                </p>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl font-sans leading-relaxed">
                This action is irreversible. All of your library data, customized settings, and platforms will be wiped instantly.
              </div>

              {authState.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg font-sans">
                  {authState.error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider pl-1">
                    Type your email to confirm
                  </label>
                  <input 
                    type="email"
                    value={deleteConfirmEmail}
                    onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                    placeholder={session.user.email}
                    className="w-full bg-[#111] border border-brand-borderSubtle rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 transition-colors font-sans"
                  />
                </div>

                <button 
                  onClick={handleDeleteProfile}
                  disabled={isDeleting || deleteConfirmEmail !== session.user.email}
                  className="w-full py-3 rounded-xl font-semibold text-sm font-sans text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : 'Permanently Delete Account'}
                </button>
              </div>
            </motion.div>
          ) : (
            // SIGN IN FLOW
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {authState.error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6 font-sans shrink-0"
                  >
                    {authState.error}
                  </motion.div>
                )}

                {authState.message && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6 font-sans shrink-0 text-center"
                  >
                    {authState.message}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {authState.view === 'login' && (
                  <LoginView 
                    key="login"
                    setView={setAuthView} 
                    onLoginPassword={handleLoginPassword} 
                    onGoogleSignIn={handleGoogleSignIn}
                    loading={authState.loading} 
                    showSignUp={false}
                  />
                )}

                {authState.view === 'login-otp' && (
                  <OtpLoginView 
                    key="login-otp"
                    setView={setAuthView} 
                    onRequestOtp={handleRequestOtp} 
                    loading={authState.loading} 
                  />
                )}

                {authState.view === 'verify-otp' && (
                  <VerifyOtpView 
                    key="verify-otp"
                    setView={setAuthView} 
                    onVerify={handleVerifyOtp} 
                    email={authState.email} 
                    loading={authState.loading} 
                  />
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};
