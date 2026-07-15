import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, Edit, Send, Trash2, ShieldAlert,
  Music, PlaySquare, Mail, Lock, Clock, ChevronRight, X, CheckCircle
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';

const supabaseUrl = 'https://ngashsoxymyzqqqisvij.supabase.co';
const supabaseKey = 'sb_publishable_EDzfAPD5vFiwDJ7gAGsgfw_T9lRmWlh';
const supabase = createClient(supabaseUrl, supabaseKey);

export const AdminUserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [otpCodes, setOtpCodes] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [activeTab, setActiveTab] = useState<'songs' | 'playlists' | 'otps' | 'emails' | 'actions'>('songs');

  // Playlist overlay
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);

  // Actions states
  const [newEmail, setNewEmail] = useState('');
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');

  const [templateType, setTemplateType] = useState('app_update');
  const [customLayout, setCustomLayout] = useState('dark');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = 'User Inspection | Birvana Admin';

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
      const email = session?.user?.email || '';
      if (email.toLowerCase() === 'birvana.official.in@gmail.com') {
        setIsAdmin(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      const email = session?.user?.email || '';
      setIsAdmin(email.toLowerCase() === 'birvana.official.in@gmail.com');
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loadingSession && isAdmin && userId) {
      loadUserData();
    }
    if (!loadingSession && !isAdmin) {
      navigate('/admin');
    }
  }, [loadingSession, isAdmin, userId]);

  const loadUserData = async () => {
    setLoadingData(true);
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setUser(profile);
      setNewEmail(profile?.email || '');

      // Fetch library data
      const resp = await fetch('/api/admin-manage-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ action: 'get_liked_songs', targetUserId: userId })
      });
      const data = await resp.json();
      if (resp.ok) {
        setSongs(data.songs || []);
        setPlaylists(data.playlists || []);
        setOtpCodes(data.otpCodes || []);
        setEmailLogs(data.emailLogs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDownloadReport = () => {
    if (!user) return;
    const report = {
      downloaded_at: new Date().toISOString(),
      user: { id: user.id, email: user.email, username: user.username, display_name: user.display_name, created_at: user.created_at, bio: user.bio },
      stats: { total_liked_songs: songs.length, total_saved_playlists: playlists.length, total_email_transactions: emailLogs.length },
      liked_songs: songs, saved_playlists: playlists, active_otp_challenges: otpCodes, email_outbound_logs: emailLogs
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Birvana_User_Report_${user.username || user.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setUpdatingEmail(true);
    setEmailSuccess('');
    try {
      const resp = await fetch('/api/admin-manage-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ action: 'update_email', targetUserId: userId, newEmail: newEmail.trim() })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      setEmailSuccess('Email reverted. Security alerts dispatched.');
      setUser((u: any) => ({ ...u, email: newEmail.trim() }));
      loadUserData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setDispatching(true);
    setDispatchSuccess('');
    try {
      const resp = await fetch('/api/admin-send-custom-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ targetUserId: userId, templateType, customSubject: customSubject.trim(), customMessage: customBody.trim() })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      setDispatchSuccess('Email dispatched and logged successfully.');
      setCustomSubject(''); setCustomBody('');
      loadUserData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDispatching(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const resp = await fetch('/api/admin-manage-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ action: 'delete', targetUserId: userId })
      });
      if (!resp.ok) throw new Error('Failed to delete');
      navigate('/admin?tab=users');
    } catch (err: any) {
      alert(err.message);
      setDeleting(false);
    }
  };

  if (loadingSession) {
    return (
      <div className="bg-brand-bg min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-brand-bg min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center text-white">
          <div className="text-center flex flex-col items-center gap-4">
            <Lock size={40} className="text-red-500" />
            <h1 className="text-2xl font-black">Access Denied</h1>
            <button onClick={() => navigate('/admin')} className="bg-brand-primary text-black font-bold px-6 py-2.5 rounded-full">
              Go to Admin Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg text-white min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-28 flex flex-col gap-8">

        {/* Back button */}
        <button
          onClick={() => navigate('/admin?tab=users')}
          className="flex items-center gap-2 text-brand-textMuted hover:text-white font-sans text-sm font-bold transition-colors self-start group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to User Directory</span>
        </button>

        {loadingData ? (
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
          </div>
        ) : user ? (
          <div className="flex flex-col gap-8" style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>

            {/* Hero Profile Header */}
            <div className="bg-[#0A0A0A] border border-brand-borderSubtle rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-primary/30 to-blue-500/20 border border-brand-primary/30 flex items-center justify-center shrink-0 text-brand-primary text-3xl font-black">
                {(user.display_name || user.email || 'U').charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-black text-white truncate">{user.display_name || 'Birvana User'}</h1>
                <p className="font-mono text-sm text-brand-textSecondary mt-1">@{user.username || 'not_set'}</p>
                <p className="font-mono text-xs text-brand-textMuted mt-0.5">{user.email}</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-sans text-brand-textSecondary">
                    ID: {user.id?.slice(0, 18)}...
                  </span>
                  <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-sans text-brand-textSecondary">
                    Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className="bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 rounded-full text-xs font-sans text-brand-primary">
                    {songs.length} Liked Songs
                  </span>
                  <span className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-sans text-blue-400">
                    {playlists.length} Playlists
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-brand-borderSubtle text-white font-sans font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                >
                  <Download size={14} />
                  <span>Audit Report</span>
                </button>
                <button
                  onClick={() => setActiveTab('actions')}
                  className="flex items-center gap-2 bg-brand-primary hover:bg-white text-black font-sans font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                >
                  <Send size={14} />
                  <span>Send Email</span>
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Liked Songs', value: songs.length, color: 'text-brand-primary' },
                { label: 'Saved Playlists', value: playlists.length, color: 'text-blue-400' },
                { label: 'Active OTP Codes', value: otpCodes.length, color: 'text-amber-400' },
                { label: 'Emails Sent', value: emailLogs.length, color: 'text-purple-400' }
              ].map((s, i) => (
                <div key={i} className="bg-[#0A0A0A] border border-brand-borderSubtle rounded-2xl p-5 flex flex-col gap-1">
                  <p className="font-sans text-xs text-brand-textMuted uppercase font-bold tracking-wider">{s.label}</p>
                  <h3 className={`font-sans text-3xl font-black ${s.color}`}>{s.value}</h3>
                </div>
              ))}
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="bg-[#0A0A0A] border border-brand-borderSubtle rounded-2xl p-6">
                <p className="font-sans text-xs text-brand-textMuted uppercase font-bold tracking-wider mb-2">Profile Bio</p>
                <p className="font-sans text-sm text-brand-textSecondary leading-relaxed italic">"{user.bio}"</p>
              </div>
            )}

            {/* Tab navigation */}
            <div className="flex items-center gap-2 bg-[#0A0A0A] border border-brand-borderSubtle rounded-2xl p-1.5 overflow-x-auto">
              {[
                { key: 'songs', label: `Liked Songs (${songs.length})` },
                { key: 'playlists', label: `Playlists (${playlists.length})` },
                { key: 'otps', label: `Active OTPs (${otpCodes.length})` },
                { key: 'emails', label: `Email Logs (${emailLogs.length})` },
                { key: 'actions', label: 'Manage Actions' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2.5 px-4 rounded-xl font-sans text-sm font-bold shrink-0 transition-all ${
                    activeTab === tab.key
                      ? tab.key === 'actions'
                        ? 'bg-brand-primary text-black'
                        : 'bg-white text-black'
                      : 'text-brand-textSecondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content panels */}
            <div className="bg-[#0A0A0A] border border-brand-borderSubtle rounded-3xl p-6 min-h-[400px]">

              {/* Songs Tab */}
              {activeTab === 'songs' && (
                <div>
                  <h2 className="font-sans font-black text-lg text-white mb-4">Synced Music Library</h2>
                  {songs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-white/5 text-[10px] font-mono uppercase tracking-wider text-brand-textMuted">
                            <th className="py-3 px-4">Track</th>
                            <th className="py-3 px-4">Artist</th>
                            <th className="py-3 px-4">Provider</th>
                            <th className="py-3 px-4 text-right">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {songs.map((song, i) => {
                            const secs = song.duration || song.duration_seconds;
                            const dur = secs ? `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}` : '—';
                            return (
                              <tr key={i} className="hover:bg-white/5 transition-colors group">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#111] border border-white/5 overflow-hidden shrink-0">
                                      {song.cover_url || song.image
                                        ? <img src={song.cover_url || song.image} alt="" className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-sm">🎵</div>
                                      }
                                    </div>
                                    <span className="font-sans font-bold text-sm text-white truncate max-w-[200px]">{song.title || song.name || '—'}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-sans text-sm text-brand-textSecondary">{song.artist || song.subtitle || '—'}</td>
                                <td className="py-3 px-4">
                                  <span className="bg-white/5 border border-white/10 text-brand-textMuted font-mono text-[10px] px-2 py-0.5 rounded capitalize">
                                    {song.source || song.provider || 'local'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-sm text-brand-textSecondary text-right">{dur}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                      <Music size={40} className="text-brand-textMuted" />
                      <p className="font-sans text-brand-textMuted text-sm">No synced songs found for this account.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Playlists Tab */}
              {activeTab === 'playlists' && (
                <div>
                  <h2 className="font-sans font-black text-lg text-white mb-4">Saved Playlists</h2>
                  {playlists.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {playlists.map((pl, i) => {
                        const tracks = pl.tracks || pl.songs || [];
                        return (
                          <div
                            key={i}
                            onClick={() => setSelectedPlaylist(pl)}
                            className="bg-[#111] hover:bg-white/5 border border-brand-borderSubtle rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.02] hover:border-brand-primary/30 group"
                          >
                            <div className="w-14 h-14 rounded-xl bg-[#0A0A0A] overflow-hidden shrink-0 border border-white/5">
                              {pl.cover_url || pl.image
                                ? <img src={pl.cover_url || pl.image} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-xl">🎵</div>
                              }
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-sans font-bold text-sm text-white truncate">{pl.title || pl.name || 'Unnamed Playlist'}</p>
                              <p className="font-sans text-xs text-brand-textMuted mt-0.5">{tracks.length} tracks</p>
                            </div>
                            <ChevronRight size={16} className="text-brand-textMuted group-hover:text-white transition-colors shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                      <PlaySquare size={40} className="text-brand-textMuted" />
                      <p className="font-sans text-brand-textMuted text-sm">No saved playlists found for this account.</p>
                    </div>
                  )}
                </div>
              )}

              {/* OTPs Tab */}
              {activeTab === 'otps' && (
                <div>
                  <h2 className="font-sans font-black text-lg text-white mb-4">Active Identity Challenges</h2>
                  {otpCodes.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {otpCodes.map((otp, i) => (
                        <div key={i} className="bg-[#111] border border-brand-borderSubtle rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono text-2xl font-black text-brand-primary tracking-widest">{otp.otp_code}</span>
                              <span className="bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">Active</span>
                            </div>
                            <p className="font-sans text-xs text-brand-textSecondary">
                              Purpose: {otp.purpose === 'verify_old_email' ? 'Identity Verification (Step 1)' : otp.purpose === 'verify_new_email' ? 'New Email Verification (Step 2)' : otp.purpose}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-mono text-xs text-brand-textMuted">Created: {new Date(otp.created_at).toLocaleString()}</p>
                            <p className="font-mono text-xs text-amber-400 mt-0.5">Expires: {new Date(otp.expires_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                      <CheckCircle size={40} className="text-brand-primary" />
                      <p className="font-sans text-brand-textMuted text-sm">No active verification challenges pending.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Email Logs Tab */}
              {activeTab === 'emails' && (
                <div>
                  <h2 className="font-sans font-black text-lg text-white mb-4">Email Audit Trail</h2>
                  {emailLogs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-white/5 text-[10px] font-mono uppercase tracking-wider text-brand-textMuted">
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Subject</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {emailLogs.map((log, i) => {
                            const labelMap: Record<string, string> = {
                              identity_verification_otp: 'Identity Verification',
                              new_email_verification_otp: 'New Email Challenge',
                              security_alert_email_change: 'Security Alert (Reverted)',
                              congratulations_email_change: 'Email Change Confirmation',
                              support_ticket_reply: 'Support Reply',
                              automation_app_update: 'App Update Announcement',
                              automation_forgot_password: 'Password Reset Help',
                              automation_scam_alert: 'Scam Recovery Guide',
                              automation_custom: 'Custom Support Message',
                            };
                            return (
                              <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4">
                                  <span className="font-sans font-bold text-sm text-white">{labelMap[log.purpose] || log.purpose}</span>
                                </td>
                                <td className="py-3 px-4 font-sans text-xs text-brand-textSecondary max-w-[280px] truncate">{log.subject}</td>
                                <td className="py-3 px-4">
                                  <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-mono uppercase px-2 py-0.5 rounded-full">{log.status}</span>
                                </td>
                                <td className="py-3 px-4 font-mono text-xs text-brand-textMuted text-right">{new Date(log.created_at).toLocaleDateString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                      <Mail size={40} className="text-brand-textMuted" />
                      <p className="font-sans text-brand-textMuted text-sm">No email history found for this account.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions Tab */}
              {activeTab === 'actions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Email Revert Tool */}
                  <div className="bg-[#111] border border-brand-borderSubtle rounded-2xl p-6 flex flex-col gap-4">
                    <div>
                      <h3 className="font-sans font-bold text-base text-white">Account Email Reversion</h3>
                      <p className="font-sans text-xs text-brand-textMuted mt-1 leading-relaxed">
                        Revert a compromised or scammed account back to the correct email address. Sends an instant recovery notification.
                      </p>
                    </div>
                    <form onSubmit={handleUpdateEmail} className="flex flex-col gap-3">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        placeholder="Verified recovery email address..."
                        required
                        className="w-full bg-[#0A0A0A] border border-brand-borderSubtle rounded-xl px-4 py-3 text-white text-sm font-sans focus:border-brand-primary focus:outline-none transition-colors"
                      />
                      {emailSuccess && (
                        <div className="flex items-center gap-2 text-brand-primary bg-brand-primary/10 border border-brand-primary/20 p-3 rounded-xl text-xs font-sans">
                          <CheckCircle size={14} /> {emailSuccess}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={updatingEmail}
                        className="bg-brand-primary hover:bg-white text-black font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <Edit size={14} />
                        {updatingEmail ? 'Applying Reversion...' : 'Apply Recovery Reversion'}
                      </button>
                    </form>
                  </div>

                  {/* Email Automation Dispatcher */}
                  <div className="bg-[#111] border border-brand-borderSubtle rounded-2xl p-6 flex flex-col gap-4">
                    <div>
                      <h3 className="font-sans font-bold text-base text-white">Dispatch Support Email</h3>
                      <p className="font-sans text-xs text-brand-textMuted mt-1 leading-relaxed">
                        Send a branded, professional email to this user's inbox instantly via Gmail SMTP.
                      </p>
                    </div>
                    <form onSubmit={handleDispatch} className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="font-sans text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">Template</label>
                        <select
                          value={templateType}
                          onChange={e => setTemplateType(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-brand-borderSubtle text-white text-sm rounded-xl px-3 py-2.5 focus:border-brand-primary focus:outline-none"
                        >
                          <option value="app_update">App Update v1.1.4</option>
                          <option value="forgot_password">Password Reset Assistance</option>
                          <option value="scam_alert">Scam Advisory & Recovery Guide</option>
                          <option value="custom">Custom Message</option>
                        </select>
                      </div>

                      {templateType === 'custom' && (
                        <div className="flex flex-col gap-1">
                          <label className="font-sans text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">Subject</label>
                          <input
                            type="text"
                            value={customSubject}
                            onChange={e => setCustomSubject(e.target.value)}
                            placeholder="Email subject line..."
                            required
                            className="w-full bg-[#0A0A0A] border border-brand-borderSubtle rounded-xl px-4 py-2.5 text-white text-sm font-sans focus:border-brand-primary focus:outline-none"
                          />
                        </div>
                      )}

                      <div className="flex flex-col gap-1">
                        <label className="font-sans text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">Message</label>
                        <textarea
                          value={customBody}
                          onChange={e => setCustomBody(e.target.value)}
                          rows={4}
                          required={templateType === 'custom'}
                          placeholder={templateType === 'custom' ? 'Type your support message...' : 'Optional notes to include...'}
                          className="w-full bg-[#0A0A0A] border border-brand-borderSubtle rounded-xl px-4 py-3 text-white text-sm font-sans focus:border-brand-primary focus:outline-none resize-none"
                        />
                      </div>

                      {dispatchSuccess && (
                        <div className="flex items-center gap-2 text-brand-primary bg-brand-primary/10 border border-brand-primary/20 p-3 rounded-xl text-xs font-sans">
                          <CheckCircle size={14} /> {dispatchSuccess}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={dispatching}
                        className="bg-white hover:bg-brand-primary text-black font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <Send size={14} />
                        {dispatching ? 'Sending Email...' : 'Dispatch Email'}
                      </button>
                    </form>
                  </div>

                  {/* Delete Account */}
                  <div className="md:col-span-2 bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                    <h3 className="font-sans font-bold text-base text-red-400 mb-2">Danger Zone</h3>
                    <p className="font-sans text-xs text-red-300/70 leading-relaxed mb-4">
                      Permanently delete this account. This will purge all their data from the database, including liked songs, playlists, and Supabase auth credentials. This action cannot be undone.
                    </p>
                    {confirmDelete ? (
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          {deleting ? 'Purging...' : 'Yes, Permanently Delete'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="bg-white/5 border border-white/10 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-transparent text-red-400 hover:text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
                      >
                        <Trash2 size={14} />
                        Delete User Account
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-brand-textMuted font-sans text-sm">
            User not found.
          </div>
        )}
      </main>

      {/* Playlist Detail Modal */}
      {selectedPlaylist && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0A0A0A] border border-brand-borderSubtle rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[75vh]" style={{ animation: 'fadeInUp 0.3s both' }}>
            <div className="p-5 border-b border-brand-borderSubtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#111] overflow-hidden border border-white/5">
                  {selectedPlaylist.cover_url || selectedPlaylist.image
                    ? <img src={selectedPlaylist.cover_url || selectedPlaylist.image} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">🎵</div>
                  }
                </div>
                <div>
                  <p className="font-sans font-black text-sm text-white">{selectedPlaylist.title || selectedPlaylist.name || 'Playlist'}</p>
                  <p className="font-sans text-xs text-brand-textMuted">{(selectedPlaylist.tracks || selectedPlaylist.songs || []).length} tracks</p>
                </div>
              </div>
              <button onClick={() => setSelectedPlaylist(null)} className="text-brand-textMuted hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-2">
              {(selectedPlaylist.tracks || selectedPlaylist.songs || []).length > 0 ? (
                (selectedPlaylist.tracks || selectedPlaylist.songs || []).map((t: any, i: number) => {
                  const secs = t.duration || t.duration_seconds;
                  const dur = secs ? `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}` : '—';
                  return (
                    <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-white/5 hover:bg-white/5 px-2 rounded transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded bg-[#111] overflow-hidden shrink-0 border border-white/5">
                          {t.cover_url || t.image ? <img src={t.cover_url || t.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">🎵</div>}
                        </div>
                        <div className="min-w-0">
                          <p className="font-sans font-bold text-xs text-white truncate">{t.title || t.name}</p>
                          <p className="font-sans text-[10px] text-brand-textMuted truncate mt-0.5">{t.artist || t.subtitle}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-brand-textSecondary shrink-0">{dur}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-brand-textMuted text-xs text-center py-10 font-sans italic">No tracks in this playlist.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
