import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Trash2, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Deletion Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('https://github.com/BrijeshShekhaliya/birvana.web/releases');

  useEffect(() => {
    const fetchDownloadUrl = async () => {
      try {
        const { data, error } = await supabase
          .from('releases')
          .select('url')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && data.url) {
          setDownloadUrl(data.url);
          return;
        }

        // Fallback to static releases.json if database is empty/inaccessible
        const res = await fetch('/releases.json');
        if (res.ok) {
          const localData = await res.json();
          if (localData?.latest?.url) {
            setDownloadUrl(localData.latest.url);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch download url, using fallback GitHub link:", err);
      }
    };

    fetchDownloadUrl();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setSession(session);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDeleteProfile = async () => {
    if (deleteConfirmEmail !== session?.user.email) {
      setDeleteError('Email does not match.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Calls a custom Postgres function to delete the user.
      // This requires setting up the 'delete_user' RPC in Supabase.
      const { error } = await supabase.rpc('delete_user');
      
      if (error) {
        throw error;
      }

      // Supabase session should automatically invalidate, but we force sign out just in case
      await supabase.auth.signOut();
      navigate('/');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account. Please try again or contact support.');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col relative overflow-hidden">
      <Navigation />
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="flex-1 pt-32 pb-16 px-6 md:px-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
        <h1 className="text-3xl md:text-4xl font-black font-sans text-white mb-8">Profile Settings</h1>

        {/* Profile Card */}
        <div className="bg-[#0A0A0A] border border-brand-borderSubtle rounded-3xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-brand-bg border border-brand-borderSubtle flex items-center justify-center shrink-0">
              <User size={40} className="text-brand-textMuted" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-white font-sans">{session.user.email}</h2>
              <p className="text-brand-textMuted text-sm font-sans mt-1">
                Member since {new Date(session.user.created_at).toLocaleDateString()}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                <a 
                  href={downloadUrl}
                  download="birvana.apk"
                  className="bg-brand-primary text-black px-6 py-2.5 rounded-full font-semibold text-sm font-sans flex items-center gap-2 hover:bg-white transition-colors"
                >
                  <Download size={16} />
                  Download App
                </a>
                <button 
                  onClick={handleLogout}
                  className="bg-[#111] text-brand-textSecondary border border-brand-borderSubtle px-6 py-2.5 rounded-full font-semibold text-sm font-sans flex items-center gap-2 hover:text-white transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        {session?.user?.email?.toLowerCase() !== 'testuserbirvana01@gmail.com' && (
          <div className="bg-red-950/10 border border-red-900/20 rounded-3xl p-6 md:p-8">
            <h3 className="text-red-500 font-bold font-sans text-lg flex items-center gap-2 mb-2">
              <AlertTriangle size={20} />
              Danger Zone
            </h3>
            <p className="text-brand-textMuted text-sm font-sans mb-6">
              Permanently delete your Birvana account and all associated data. This action cannot be undone. If you are logged into the mobile app, you will be instantly logged out.
            </p>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-2.5 rounded-xl font-semibold text-sm font-sans flex items-center gap-2 hover:bg-red-500 hover:text-white transition-colors"
            >
              <Trash2 size={16} />
              Delete Profile
            </button>
          </div>
        )}

      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0A0A] border border-brand-borderSubtle rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white font-sans mb-2">Delete Account</h3>
              <p className="text-brand-textMuted text-sm font-sans mb-6">
                This action is permanent and will destroy all your saved data across all devices. Please type your email <strong className="text-white">{session.user.email}</strong> to confirm.
              </p>

              {deleteError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 font-sans">
                  {deleteError}
                </div>
              )}

              <input 
                type="email"
                value={deleteConfirmEmail}
                onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                placeholder={session.user.email}
                className="w-full bg-[#111] border border-brand-borderSubtle rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 transition-colors font-sans mb-6"
              />

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmEmail('');
                    setDeleteError(null);
                  }}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm font-sans text-brand-textSecondary bg-[#111] border border-brand-borderSubtle hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteProfile}
                  disabled={isDeleting || deleteConfirmEmail !== session.user.email}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm font-sans text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : 'Confirm Deletion'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};
