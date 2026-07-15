import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Music, Radio, Mail, Search, Trash2, CheckCircle, 
  ArrowRight, ShieldAlert, Lock, Clock, MessageSquare, ChevronRight, X, Send,
  Download, Edit, PlaySquare, ExternalLink, FileText
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SupportInbox } from '../components/SupportInbox';
import { SupportConversation } from '../components/SupportConversation';

const supabaseUrl = 'https://ngashsoxymyzqqqisvij.supabase.co';
const supabasePublishableKey = 'sb_publishable_EDzfAPD5vFiwDJ7gAGsgfw_T9lRmWlh';
const supabase = createClient(supabaseUrl, supabasePublishableKey);

interface UserStats {
  totalUsers: number;
  totalStreams: number;
  totalLikes: number;
  pendingTickets: number;
}

interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  bio: string | null;
}

interface SupportTicket {
  id: string;
  user_id: string | null;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface RegistrationTrend {
  date: string;
  count: number;
}

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'tickets'>('dashboard');
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Data States
  const [stats, setStats] = useState<UserStats | null>(null);
  const [trends, setTrends] = useState<RegistrationTrend[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Search & Filters
  const [userQuery, setUserQuery] = useState('');
  const [ticketFilter, setTicketFilter] = useState<'pending' | 'resolved'>('pending');

  // Detail Drawer States
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userLikedSongs, setUserLikedSongs] = useState<any[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [userOtpCodes, setUserOtpCodes] = useState<any[]>([]);
  const [userEmailLogs, setUserEmailLogs] = useState<any[]>([]);
  const [drawerTab, setDrawerTab] = useState<'songs' | 'playlists' | 'otps' | 'emails' | 'actions'>('songs');
  const [loadingLikedSongs, setLoadingLikedSongs] = useState(false);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Playlist popup/overlay
  const [selectedPlaylistSongs, setSelectedPlaylistSongs] = useState<any[]>([]);
  const [selectedPlaylistTitle, setSelectedPlaylistTitle] = useState<string>('');
  const [isPlaylistSongsOpen, setIsPlaylistSongsOpen] = useState(false);

  // Administrative email revert state
  const [newRecoveryEmail, setNewRecoveryEmail] = useState('');
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState('');

  // Email Automation forms state
  const [autoTemplateType, setAutoTemplateType] = useState<string>('app_update');
  const [customLayout, setCustomLayout] = useState<string>('dark');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [dispatchingEmail, setDispatchingEmail] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState('');

  // Ticket Modal States
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // New support platform
  const [selectedSupportCase, setSelectedSupportCase] = useState<any | null>(null);
  const [supportRefreshTrigger, setSupportRefreshTrigger] = useState(0);

  // Fetch Dashboard Stats and Data from Serverless APIs
  const fetchAdminData = async (token: string) => {
    setLoadingData(true);
    try {
      const response = await fetch('/api/admin-get-stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch admin statistics');

      setStats(data.stats);
      setTrends(data.userTrends);
      setUsers(data.users);
      setTickets(data.tickets);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error loading dashboard data.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    document.title = 'Admin Console | Birvana';
    
    // Auth Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
      
      const userEmail = session?.user?.email || '';
      if (userEmail.toLowerCase() === 'birvana.official.in@gmail.com') {
        setIsAdmin(true);
        fetchAdminData(session?.access_token || '');
      } else {
        setIsAdmin(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const userEmail = session?.user?.email || '';
      if (userEmail.toLowerCase() === 'birvana.official.in@gmail.com') {
        setIsAdmin(true);
        fetchAdminData(session?.access_token || '');
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch User details and libraries
  const handleViewUser = async (user: UserProfile) => {
    setSelectedUser(user);
    setUserLikedSongs([]);
    setUserPlaylists([]);
    setUserOtpCodes([]);
    setUserEmailLogs([]);
    setDrawerTab('songs');
    setLoadingLikedSongs(true);
    
    // Reset forms
    setNewRecoveryEmail(user.email || '');
    setEmailUpdateSuccess('');
    setDispatchSuccess('');
    setCustomSubject('');
    setCustomBody('');
    setCustomLayout('dark');

    try {
      const response = await fetch('/api/admin-manage-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'get_liked_songs',
          targetUserId: user.id
        })
      });
      const data = await response.json();
      if (response.ok) {
        setUserLikedSongs(data.songs || []);
        setUserPlaylists(data.playlists || []);
        setUserOtpCodes(data.otpCodes || []);
        setUserEmailLogs(data.emailLogs || []);
      }
    } catch (err) {
      console.error('Failed to load user logs/data:', err);
    } finally {
      setLoadingLikedSongs(false);
    }
  };

  // Administrative email update/revert (Scam Helper)
  const handleUpdateUserEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newRecoveryEmail.trim()) return;

    setUpdatingEmail(true);
    setEmailUpdateSuccess('');
    try {
      const response = await fetch('/api/admin-manage-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'update_email',
          targetUserId: selectedUser.id,
          newEmail: newRecoveryEmail.trim()
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update email');

      setEmailUpdateSuccess('User email successfully reverted. Reversion alert emails sent.');
      
      // Update local states
      const updatedUser = { ...selectedUser, email: newRecoveryEmail.trim() };
      setSelectedUser(updatedUser);
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
      
      // Refresh user logs
      handleViewUser(updatedUser);
    } catch (err: any) {
      alert(err.message || 'Error updating email');
    } finally {
      setUpdatingEmail(false);
    }
  };

  // Dispatch Automated Email
  const handleDispatchAutomationEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setDispatchingEmail(true);
    setDispatchSuccess('');
    try {
      const response = await fetch('/api/admin-send-custom-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          templateType: autoTemplateType,
          customSubject: customSubject.trim(),
          customMessage: customBody.trim()
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send automated email');

      setDispatchSuccess('Email automation dispatched successfully and logged in database.');
      setCustomSubject('');
      setCustomBody('');
      
      // Refresh logs
      handleViewUser(selectedUser);
    } catch (err: any) {
      alert(err.message || 'Error dispatching automation');
    } finally {
      setDispatchingEmail(false);
    }
  };

  // Download User JSON Audit Report
  const handleDownloadUserReport = () => {
    if (!selectedUser) return;

    const reportData = {
      downloaded_at: new Date().toISOString(),
      user: {
        id: selectedUser.id,
        email: selectedUser.email,
        username: selectedUser.username,
        display_name: selectedUser.display_name,
        created_at: selectedUser.created_at,
        bio: selectedUser.bio
      },
      stats: {
        total_liked_songs: userLikedSongs.length,
        total_saved_playlists: userPlaylists.length,
        total_email_transactions: userEmailLogs.length
      },
      liked_songs: userLikedSongs,
      saved_playlists: userPlaylists,
      active_otp_challenges: userOtpCodes,
      email_outbound_logs: userEmailLogs
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Birvana_User_Report_${selectedUser.username || selectedUser.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Delete user account
  const handleDeleteUser = async (userId: string) => {
    setDeletingUser(true);
    try {
      const response = await fetch('/api/admin-manage-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'delete',
          targetUserId: userId
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete user account');

      setSelectedUser(null);
      setConfirmDeleteUserId(null);
      if (session?.access_token) {
        fetchAdminData(session.access_token);
      }
    } catch (err: any) {
      alert(err.message || 'Error purging account');
    } finally {
      setDeletingUser(false);
    }
  };

  // Reply and resolve Ticket
  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setSendingReply(true);
    try {
      const response = await fetch('/api/admin-reply-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          replyText: replyText.trim(),
          recipientEmail: selectedTicket.email,
          ticketSubject: selectedTicket.subject,
          originalMessage: selectedTicket.message
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reply ticket');

      setReplyText('');
      setSelectedTicket(null);
      if (session?.access_token) {
        fetchAdminData(session.access_token);
      }
    } catch (err: any) {
      alert(err.message || 'Error sending reply');
    } finally {
      setSendingReply(false);
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(u => 
    (u.email || '').toLowerCase().includes(userQuery.toLowerCase()) || 
    (u.username || '').toLowerCase().includes(userQuery.toLowerCase()) ||
    (u.display_name || '').toLowerCase().includes(userQuery.toLowerCase())
  );

  const filteredTickets = tickets.filter(t => t.status === ticketFilter);

  // Loading Session Screen
  if (loadingSession) {
    return (
      <div className="bg-brand-bg text-white min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Not Logged In or Not Admin Access
  if (!session || !isAdmin) {
    return (
      <div className="bg-brand-bg text-white min-h-screen flex flex-col justify-between">
        <Navigation />
        <main className="flex-1 flex items-center justify-center px-6 py-24 select-none">
          <div 
            className="max-w-[440px] w-full bg-[#0E0A07]/50 border border-red-500/20 rounded-3xl p-8 text-center backdrop-blur-md shadow-2xl relative overflow-hidden"
            style={{ animation: 'adminFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both' }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/50"></div>
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <Lock className="text-red-500" size={28} />
            </div>
            <h1 className="font-sans font-black text-2xl text-white mb-2">Access Denied</h1>
            <p className="font-sans text-brand-textSecondary text-sm leading-relaxed mb-8">
              This area is restricted to system administrators. Log in using the official management account to access statistics.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold font-sans hover:bg-brand-primary transition-colors duration-300"
            >
              <span>Go to Login</span>
              <ChevronRight size={16} />
            </a>
          </div>
        </main>
        <Footer />
        <style>{`
          @keyframes adminFadeIn {
            from { opacity: 0; transform: scale(0.95) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // Calculate SVG Graph Coordinates
  const chartHeight = 120;
  const chartWidth = 560;
  const maxCount = trends.length > 0 ? Math.max(...trends.map(t => t.count), 5) : 5;

  const points = trends.map((t, idx) => {
    const x = (idx / (trends.length - 1 || 1)) * chartWidth;
    const y = chartHeight - (t.count / maxCount) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = trends.length > 0 
    ? `0,${chartHeight} ${points} ${chartWidth},${chartHeight}` 
    : '';

  return (
    <div className="bg-brand-bg text-brand-textPrimary min-h-screen flex flex-col select-none">
      <Navigation />

      {/* ── Admin Sub-Header: horizontal tab navigation ── */}
      <div className="flex-shrink-0 border-b border-[#1a1a1a] bg-[#080808] px-8 pt-28 select-none">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-sans font-black text-2xl text-white tracking-tight">Admin Console</h1>
              <p className="font-sans text-sm text-brand-textMuted mt-0.5">Birvana management dashboard</p>
            </div>
            {loadingData && !stats && (
              <div className="w-5 h-5 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
            )}
          </div>

          {/* Horizontal tab bar */}
          <div className="flex items-center gap-1">
            {([
              { id: 'dashboard', label: 'Dashboard', icon: <Radio size={15} /> },
              { id: 'users',     label: 'User Directory', icon: <Users size={15} /> },
              { id: 'tickets',   label: 'Help Inbox', icon: <Mail size={15} />, badge: stats && stats.pendingTickets > 0 ? stats.pendingTickets : null },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3 font-sans font-bold text-sm transition-all rounded-t-xl ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-brand-textMuted hover:text-white hover:bg-white/4'
                }`}
              >
                {tab.icon}
                {tab.label}
                {'badge' in tab && tab.badge != null && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-brand-primary text-black' : 'bg-red-500 text-white animate-pulse'
                  }`}>{tab.badge}</span>
                )}
                {/* Active underline */}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dynamic Tab Content ── */}
      {activeTab === 'tickets' ? (
        /* Help Inbox — full remaining viewport height, no padding, no footer */
        <div className="flex-1 overflow-hidden" style={{ animation: 'adminFadeIn 0.3s both' }}>
          <div className="h-full flex">
            {/* Left: inbox list */}
            <div className="w-[380px] shrink-0 h-full">
              <SupportInbox
                token={session?.access_token || ''}
                onSelectCase={setSelectedSupportCase}
                selectedCaseId={selectedSupportCase?.id || null}
                refreshTrigger={supportRefreshTrigger}
              />
            </div>
            {/* Right: conversation */}
            <div className="flex-1 overflow-hidden bg-[#0d0d0d] border-l border-[#1a1a1a]">
              {selectedSupportCase ? (
                <SupportConversation
                  key={selectedSupportCase.id}
                  caseId={selectedSupportCase.id}
                  token={session?.access_token || ''}
                  onUpdated={() => setSupportRefreshTrigger(t => t + 1)}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-8">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Mail size={36} className="text-brand-textMuted" />
                  </div>
                  <div>
                    <p className="font-sans font-black text-white text-lg">Select a case to view</p>
                    <p className="font-sans text-brand-textMuted text-sm mt-2 max-w-xs leading-relaxed">
                      Choose a support case from the inbox on the left. Hit the sync button ↻ to pull new Gmail emails into the system.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Dashboard & Users — scrollable content with padding */
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-8 py-8">
            {!stats && loadingData ? (
              <div className="flex items-center justify-center min-h-[40vh]">
                <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
              </div>
            ) : (
              <>

              {/* Tab 1: Dashboard */}
              {activeTab === 'dashboard' && stats && (
                <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'adminFadeIn 0.4s both' }}>
                  {/* Grid Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#0A0A0A] border border-brand-borderSubtle p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
                      <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/25 rounded-full flex items-center justify-center shrink-0">
                        <Users className="text-blue-400" size={20} />
                      </div>
                      <div>
                        <p className="font-sans text-xs text-brand-textMuted uppercase font-bold tracking-wider">Total Users</p>
                        <h2 className="font-sans text-2xl font-black text-white mt-0.5">{stats.totalUsers}</h2>
                      </div>
                    </div>

                    <div className="bg-[#0A0A0A] border border-brand-borderSubtle p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
                      <div className="w-12 h-12 bg-brand-primary/10 border border-brand-primary/25 rounded-full flex items-center justify-center shrink-0">
                        <Music className="text-brand-primary" size={20} />
                      </div>
                      <div>
                        <p className="font-sans text-xs text-brand-textMuted uppercase font-bold tracking-wider">Liked Songs</p>
                        <h2 className="font-sans text-2xl font-black text-white mt-0.5">{stats.totalLikes}</h2>
                      </div>
                    </div>

                    <div className="bg-[#0A0A0A] border border-brand-borderSubtle p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
                      <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/25 rounded-full flex items-center justify-center shrink-0">
                        <Radio className="text-purple-400" size={20} />
                      </div>
                      <div>
                        <p className="font-sans text-xs text-brand-textMuted uppercase font-bold tracking-wider">Total Streams</p>
                        <h2 className="font-sans text-2xl font-black text-white mt-0.5">{stats.totalStreams}</h2>
                      </div>
                    </div>

                    <div className="bg-[#0A0A0A] border border-brand-borderSubtle p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
                      <div className="w-12 h-12 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center shrink-0">
                        <Mail className="text-red-400" size={20} />
                      </div>
                      <div>
                        <p className="font-sans text-xs text-brand-textMuted uppercase font-bold tracking-wider">Help Inbox</p>
                        <h2 className="font-sans text-2xl font-black text-white mt-0.5">{stats.pendingTickets}</h2>
                      </div>
                    </div>
                  </div>

                  {/* SVG Line Graph */}
                  <div className="bg-[#0A0A0A] border border-brand-borderSubtle p-6 rounded-2xl flex flex-col gap-6 text-left">
                    <div>
                      <h2 className="font-sans text-lg font-black text-white">Registration Activity</h2>
                      <p className="font-sans text-xs text-brand-textMuted mt-0.5">Curve of new user sign-ups over the last 7 days</p>
                    </div>

                    {trends.length > 0 ? (
                      <div className="w-full overflow-x-auto">
                        <div className="min-w-[580px] h-[160px] relative">
                          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                            <defs>
                              <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1DB954" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#1DB954" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            
                            {/* Area Fill */}
                            {fillPoints && <polygon points={fillPoints} fill="url(#chartGlow)" />}
                            
                            {/* Line path */}
                            {points && (
                              <polyline
                                fill="none"
                                stroke="#1DB954"
                                strokeWidth="3"
                                points={points}
                                strokeDasharray="1000"
                                strokeDashoffset="0"
                                style={{
                                  animation: 'drawChartLine 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                                }}
                              />
                            )}

                            {/* Dots over coordinates */}
                            {trends.map((t, idx) => {
                              const x = (idx / (trends.length - 1 || 1)) * chartWidth;
                              const y = chartHeight - (t.count / maxCount) * chartHeight;
                              return (
                                <g key={idx} className="group cursor-pointer">
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="5"
                                    fill="#1DB954"
                                    stroke="#0A0A0A"
                                    strokeWidth="2"
                                  />
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="10"
                                    fill="#1DB954"
                                    opacity="0"
                                    className="hover:opacity-20 transition-opacity"
                                  />
                                </g>
                              );
                            })}
                          </svg>
                          
                          {/* Label values bottom */}
                          <div className="flex justify-between mt-3 px-1 text-[11px] font-mono text-brand-textMuted uppercase">
                            {trends.map((t, idx) => {
                              const dateParts = t.date.split('-');
                              const label = `${dateParts[1]}/${dateParts[2]}`; // MM/DD
                              return (
                                <div key={idx} className="text-center w-12 shrink-0">
                                  <span>{label}</span>
                                  <div className="font-bold text-white mt-0.5">{t.count}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-brand-textMuted text-sm font-sans">No activity trend available.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: User Management Directory */}
              {activeTab === 'users' && (
                <div className="flex flex-col gap-4 animate-fade-in text-left" style={{ animation: 'adminFadeIn 0.4s both' }}>
                  
                  {/* Search bar */}
                  <div className="flex items-center gap-3 bg-[#0A0A0A] border border-brand-borderSubtle rounded-2xl px-4 py-3">
                    <Search className="text-brand-textMuted" size={18} />
                    <input
                      type="text"
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="Search users by display name, username, or email address..."
                      className="w-full bg-transparent text-white font-sans text-sm outline-none placeholder:text-brand-textMuted"
                    />
                  </div>

                  {/* Users Table */}
                  <div className="bg-[#0A0A0A] border border-brand-borderSubtle rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-brand-borderSubtle bg-brand-bg/25">
                            <th className="px-6 py-4 text-left font-sans text-xs font-bold text-brand-textMuted uppercase tracking-wider">User Info</th>
                            <th className="px-6 py-4 text-left font-sans text-xs font-bold text-brand-textMuted uppercase tracking-wider">User Handle</th>
                            <th className="px-6 py-4 text-left font-sans text-xs font-bold text-brand-textMuted uppercase tracking-wider">Registered</th>
                            <th className="px-6 py-4 text-right font-sans text-xs font-bold text-brand-textMuted uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-borderSubtle">
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((u, idx) => (
                              <tr key={u.id || idx} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-brand-bg border border-brand-borderSubtle flex items-center justify-center shrink-0 text-brand-primary text-sm font-sans font-bold">
                                      {u.display_name ? u.display_name.charAt(0).toUpperCase() : (u.email ? u.email.charAt(0).toUpperCase() : 'U')}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-sans font-bold text-sm text-white">{u.display_name || 'Birvana User'}</span>
                                      <span className="font-mono text-xs text-brand-textMuted">{u.email || 'No email'}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-brand-textSecondary">
                                  @{u.username || 'not_set'}
                                </td>
                                <td className="px-6 py-4 font-sans text-xs text-brand-textSecondary">
                                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    onClick={() => navigate(`/admin/user/${u.id}`)}
                                    className="bg-brand-primary/10 hover:bg-brand-primary border border-brand-primary/20 hover:border-transparent text-brand-primary hover:text-black font-sans font-bold text-xs px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                                  >
                                    Inspect Profile
                                    <span style={{fontSize:'10px'}}>↗</span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-brand-textMuted text-sm font-sans">
                                No users matched your search query.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}



              </>
            )}
          </div>
        </main>
      )}

      {/* User Details Slide-over Drawer (WIDER layout: 880px max width) */}
      {selectedUser && (
        <div className="fixed inset-0 z-[1000] flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
          {/* Backdrop Closer */}
          <div className="absolute inset-0" onClick={() => setSelectedUser(null)}></div>
          
          <div 
            className="w-full max-w-[880px] bg-[#0A0A0A] border-l border-brand-borderSubtle h-full shadow-2xl flex flex-col relative z-10 animate-slide-left"
            style={{
              animation: 'slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) both'
            }}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-brand-borderSubtle bg-brand-bg/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-brand-primary rounded-full animate-pulse"></div>
                <span className="font-sans font-bold text-white text-base">User Inspection Console</span>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-brand-textMuted hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Split view Grid layout */}
            <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-brand-borderSubtle overflow-hidden">
              
              {/* Left Column: Account Profile & Identity management */}
              <div className="w-full md:w-[320px] shrink-0 p-6 flex flex-col gap-6 overflow-y-auto text-left">
                
                {/* Profile Avatar Card */}
                <div className="flex items-center gap-4 bg-[#111] p-5 rounded-2xl border border-brand-borderSubtle">
                  <div className="w-14 h-14 rounded-full bg-brand-bg border border-brand-borderSubtle flex items-center justify-center shrink-0 text-brand-primary text-xl font-bold font-sans">
                    {selectedUser.display_name ? selectedUser.display_name.charAt(0).toUpperCase() : (selectedUser.email ? selectedUser.email.charAt(0).toUpperCase() : 'U')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-sans font-bold text-white text-sm truncate leading-tight">{selectedUser.display_name || 'Birvana User'}</h3>
                    <span className="font-mono text-[10px] text-brand-textSecondary block mt-0.5 truncate">@{selectedUser.username || 'not_set'}</span>
                    <span className="font-mono text-[10px] text-brand-textMuted block mt-1 truncate">{selectedUser.email}</span>
                  </div>
                </div>

                {/* Report Download */}
                <button
                  onClick={handleDownloadUserReport}
                  className="w-full bg-[#111] hover:bg-white/5 border border-brand-borderSubtle text-white font-sans font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <Download size={13} />
                  <span>Download Audit Report</span>
                </button>

                {/* Identity Info Items */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="font-sans text-[11px] text-brand-textMuted uppercase font-bold tracking-wider">Account ID</span>
                    <span className="font-mono text-[10px] text-brand-textSecondary truncate max-w-[160px]" title={selectedUser.id}>{selectedUser.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="font-sans text-[11px] text-brand-textMuted uppercase font-bold tracking-wider">Registered</span>
                    <span className="font-sans text-[11px] text-brand-textSecondary">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex flex-col gap-1 py-2">
                    <span className="font-sans text-[11px] text-brand-textMuted uppercase font-bold tracking-wider">Bio</span>
                    <p className="font-sans text-xs text-brand-textSecondary leading-relaxed italic bg-white/5 p-3 rounded-xl mt-1">
                      {selectedUser.bio || 'No profile biography provided.'}
                    </p>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-auto pt-6 border-t border-white/5">
                  {confirmDeleteUserId === selectedUser.id ? (
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex flex-col gap-3 animate-scale-in">
                      <div className="flex items-start gap-3">
                        <ShieldAlert className="text-red-500 mt-0.5 shrink-0" size={18} />
                        <p className="font-sans text-xs text-red-200 leading-relaxed">
                          Are you sure you want to permanently delete this user account? This cannot be undone and will purge all their synced songs, profile settings, and login credentials.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleDeleteUser(selectedUser.id)}
                          disabled={deletingUser}
                          className="bg-red-500 hover:bg-red-600 text-white font-sans font-bold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                        >
                          {deletingUser ? 'Purging Account...' : 'Confirm Purge'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteUserId(null)}
                          className="bg-white/5 text-brand-textSecondary hover:text-white font-sans font-bold text-xs px-4 py-2 rounded-xl border border-brand-borderSubtle transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteUserId(selectedUser.id)}
                      className="w-full bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-transparent text-red-500 hover:text-white font-sans font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <Trash2 size={14} />
                      <span>Delete User Account</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Tabbed analytics and logs */}
              <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden text-left">
                
                {/* Tab selector */}
                <div className="flex items-center gap-1.5 bg-[#111] border border-brand-borderSubtle rounded-2xl p-1 shrink-0 overflow-x-auto">
                  <button
                    onClick={() => setDrawerTab('songs')}
                    className={`py-2 px-3.5 rounded-xl font-sans text-xs font-bold transition-all shrink-0 ${
                      drawerTab === 'songs' ? 'bg-white text-black' : 'text-brand-textSecondary hover:text-white'
                    }`}
                  >
                    Liked Songs ({userLikedSongs.length})
                  </button>
                  <button
                    onClick={() => setDrawerTab('playlists')}
                    className={`py-2 px-3.5 rounded-xl font-sans text-xs font-bold transition-all shrink-0 ${
                      drawerTab === 'playlists' ? 'bg-white text-black' : 'text-brand-textSecondary hover:text-white'
                    }`}
                  >
                    Playlists ({userPlaylists.length})
                  </button>
                  <button
                    onClick={() => setDrawerTab('otps')}
                    className={`py-2 px-3.5 rounded-xl font-sans text-xs font-bold transition-all relative shrink-0 ${
                      drawerTab === 'otps' ? 'bg-white text-black' : 'text-brand-textSecondary hover:text-white'
                    }`}
                  >
                    Active OTPs ({userOtpCodes.length})
                    {userOtpCodes.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                    )}
                  </button>
                  <button
                    onClick={() => setDrawerTab('emails')}
                    className={`py-2 px-3.5 rounded-xl font-sans text-xs font-bold transition-all shrink-0 ${
                      drawerTab === 'emails' ? 'bg-white text-black' : 'text-brand-textSecondary hover:text-white'
                    }`}
                  >
                    Email Logs ({userEmailLogs.length})
                  </button>
                  <button
                    onClick={() => setDrawerTab('actions')}
                    className={`py-2 px-3.5 rounded-xl font-sans text-xs font-bold transition-all shrink-0 ${
                      drawerTab === 'actions' ? 'bg-brand-primary text-black' : 'text-brand-textSecondary hover:text-white'
                    }`}
                  >
                    Manage Actions
                  </button>
                </div>

                {/* Tab Content Box */}
                <div className="flex-1 overflow-y-auto bg-brand-bg/40 border border-brand-borderSubtle p-5 rounded-2xl min-h-[300px]">
                  {loadingLikedSongs ? (
                    <div className="h-full flex items-center justify-center py-20">
                      <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      {/* Sub-Tab 1: Liked Songs detailed list */}
                      {drawerTab === 'songs' && (
                        <div className="flex flex-col gap-2">
                          <h4 className="font-sans font-bold text-sm text-white mb-2">Metadata Sync Library</h4>
                          {userLikedSongs.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-white/5 font-mono text-[9px] uppercase tracking-wider text-brand-textMuted">
                                    <th className="py-2 px-3">Title & Artist</th>
                                    <th className="py-2 px-3">Provider</th>
                                    <th className="py-2 px-3 text-right">Duration</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {userLikedSongs.map((song, idx) => {
                                    const seconds = song.duration || song.duration_seconds;
                                    const minutesLabel = seconds ? `${Math.floor(seconds / 60)}:${(seconds % 60 < 10 ? '0' : '')}${Math.floor(seconds % 60)}` : 'N/A';
                                    const provider = song.source || song.provider || 'Local / Other';
                                    
                                    return (
                                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="py-2 px-3">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-[#111] overflow-hidden shrink-0 border border-white/5">
                                              {song.cover_url || song.image ? (
                                                <img src={song.cover_url || song.image} alt="" className="w-full h-full object-cover" />
                                              ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs">🎵</div>
                                              )}
                                            </div>
                                            <div className="min-w-0">
                                              <p className="font-sans font-bold text-xs text-white truncate max-w-[220px]">{song.title || song.name}</p>
                                              <p className="font-sans text-[10px] text-brand-textMuted truncate max-w-[220px] mt-0.5">{song.artist || song.subtitle}</p>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="py-2 px-3 font-sans text-xs text-brand-textSecondary capitalize">
                                          {provider}
                                        </td>
                                        <td className="py-2 px-3 font-mono text-xs text-brand-textSecondary text-right">
                                          {minutesLabel}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-brand-textMuted text-xs font-sans italic p-4 text-center">
                              No synced favorites found in database.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Sub-Tab 2: Saved Playlists with internal tracks inspection */}
                      {drawerTab === 'playlists' && (
                        <div className="flex flex-col gap-3">
                          <h4 className="font-sans font-bold text-sm text-white mb-2">User Saved Playlists</h4>
                          {userPlaylists.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {userPlaylists.map((playlist, idx) => {
                                const playlistTracks = playlist.tracks || playlist.songs || [];
                                const count = playlistTracks.length;
                                const cover = playlist.cover_url || playlist.image || '';
                                
                                return (
                                  <div 
                                    key={idx}
                                    onClick={() => {
                                      setSelectedPlaylistSongs(playlistTracks);
                                      setSelectedPlaylistTitle(playlist.title || playlist.name || 'Unnamed Playlist');
                                      setIsPlaylistSongsOpen(true);
                                    }}
                                    className="bg-[#111] hover:bg-white/5 border border-brand-borderSubtle p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-colors duration-300 hover:scale-[1.01]"
                                  >
                                    <div className="w-12 h-12 rounded bg-[#0A0A0A] overflow-hidden shrink-0 border border-white/5">
                                      {cover ? (
                                        <img src={cover} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs">🎵</div>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-sans font-bold text-xs text-white truncate">{playlist.title || playlist.name || 'Saved Playlist'}</p>
                                      <p className="font-sans text-[10px] text-brand-textMuted mt-0.5">{count} tracks saved</p>
                                    </div>
                                    <ChevronRight size={14} className="text-brand-textMuted shrink-0" />
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-brand-textMuted text-xs font-sans italic p-4 text-center">
                              No saved playlists found for this account.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Sub-Tab 3: Active verification codes */}
                      {drawerTab === 'otps' && (
                        <div className="flex flex-col gap-3">
                          <h4 className="font-sans font-bold text-sm text-white mb-2">Pending Identity Challenges</h4>
                          {userOtpCodes.length > 0 ? (
                            <div className="flex flex-col gap-3">
                              {userOtpCodes.map((otp, idx) => {
                                const purposeLabel = otp.purpose === 'verify_old_email' 
                                  ? 'Identity Verification OTP (Email Change Step 1)' 
                                  : (otp.purpose === 'verify_new_email' ? 'New Contact Verification OTP (Step 2)' : otp.purpose);
                                
                                return (
                                  <div key={idx} className="bg-[#111] border border-brand-borderSubtle p-4 rounded-xl flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                      <span className="font-mono text-base font-black text-brand-primary tracking-wider">{otp.otp_code}</span>
                                      <span className="bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono">
                                        Active
                                      </span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-[11px] font-sans text-brand-textSecondary mt-1">
                                      <p><span className="text-brand-textMuted">Purpose:</span> {purposeLabel}</p>
                                      <p><span className="text-brand-textMuted">Created:</span> {new Date(otp.created_at).toLocaleString()}</p>
                                      <p><span className="text-brand-textMuted">Expires:</span> {new Date(otp.expires_at).toLocaleString()}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-brand-textMuted text-xs font-sans italic p-4 text-center">
                              No active verification codes currently pending for this account.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Sub-Tab 4: Email logs audit trail */}
                      {drawerTab === 'emails' && (
                        <div className="flex flex-col gap-2">
                          <h4 className="font-sans font-bold text-sm text-white mb-2">Email Audit Logs (Outbound)</h4>
                          {userEmailLogs.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {userEmailLogs.map((log, idx) => {
                                let label = log.purpose;
                                if (log.purpose === 'identity_verification_otp') label = 'Identity Verification';
                                else if (log.purpose === 'new_email_verification_otp') label = 'New Email Challenge';
                                else if (log.purpose === 'security_alert_email_change') label = 'Security Warning (Email Removed)';
                                else if (log.purpose === 'congratulations_email_change') label = 'Email Changed Welcome';
                                else if (log.purpose === 'support_ticket_reply') label = 'Support Inquiry Reply';
                                else if (log.purpose === 'automation_app_update') label = 'App Release Announcement';
                                else if (log.purpose === 'automation_forgot_password') label = 'Password Reset Help';
                                else if (log.purpose === 'automation_scam_alert') label = 'Compromised Recovery Guide';

                                return (
                                  <div key={idx} className="bg-[#111] p-3 rounded-xl border border-white/5 flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-sans font-bold text-xs text-white">{label}</span>
                                        <span className="bg-green-500/10 text-green-400 font-mono text-[8px] px-1.5 py-0.25 rounded border border-green-500/15 uppercase">
                                          {log.status}
                                        </span>
                                      </div>
                                      <p className="font-sans text-[10px] text-brand-textSecondary mt-0.5 truncate" title={log.subject}>
                                        Subject: {log.subject}
                                      </p>
                                    </div>
                                    <div className="font-mono text-[10px] text-brand-textMuted shrink-0 text-right">
                                      {new Date(log.created_at).toLocaleDateString()}<br/>
                                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-brand-textMuted text-xs font-sans italic p-4 text-center">
                              No automated email transactions logged for this address.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Sub-Tab 5: Administrative recovery and email tools */}
                      {drawerTab === 'actions' && (
                        <div className="flex flex-col gap-6">
                          
                          {/* Part A: Administrative recovery email revert */}
                          <div className="bg-[#111] border border-brand-borderSubtle p-5 rounded-xl flex flex-col gap-4">
                            <div>
                              <h4 className="font-sans font-bold text-sm text-white">Revert / Change Account Email</h4>
                              <p className="font-sans text-[11px] text-brand-textMuted mt-0.5">Use this security tool to revert a scammed account back to their original address. Dispatches instant confirmation alerts.</p>
                            </div>

                            <form onSubmit={handleUpdateUserEmail} className="flex flex-col gap-3">
                              <input
                                type="email"
                                value={newRecoveryEmail}
                                onChange={(e) => setNewRecoveryEmail(e.target.value)}
                                placeholder="Enter recovered target email..."
                                required
                                className="w-full bg-[#0A0A0A] border border-brand-borderSubtle rounded-xl px-4 py-2.5 text-white text-xs font-sans focus:border-brand-primary focus:outline-none transition-colors"
                              />

                              {emailUpdateSuccess && (
                                <div className="text-brand-primary bg-brand-primary/10 border border-brand-primary/20 p-3 rounded-xl font-sans text-xs">
                                  {emailUpdateSuccess}
                                </div>
                              )}

                              <button
                                type="submit"
                                disabled={updatingEmail}
                                className="w-full bg-brand-primary text-black font-semibold font-sans text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-white transition-colors"
                              >
                                <Edit size={13} />
                                <span>{updatingEmail ? 'Updating Account...' : 'Apply Recovery Reversion'}</span>
                              </button>
                            </form>
                          </div>

                          {/* Part B: Templated Email Dispatcher */}
                          <div className="bg-[#111] border border-brand-borderSubtle p-5 rounded-xl flex flex-col gap-4">
                            <div>
                              <h4 className="font-sans font-bold text-sm text-white">Send Branded Support Email</h4>
                              <p className="font-sans text-[11px] text-brand-textMuted mt-0.5">Dispatch pre-designed luxury notifications directly to this user's inbox.</p>
                            </div>

                            <form onSubmit={handleDispatchAutomationEmail} className="flex flex-col gap-3">
                              <div className="flex flex-col gap-1 text-left">
                                <label className="font-sans text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">Select Preset Template</label>
                                <select
                                  value={autoTemplateType}
                                  onChange={(e) => setAutoTemplateType(e.target.value)}
                                  className="w-full bg-[#0A0A0A] border border-brand-borderSubtle text-white text-xs rounded-xl px-3 py-2.5 focus:border-brand-primary focus:outline-none"
                                >
                                  <option value="app_update">App Update Release (Version 1.1.4 details)</option>
                                  <option value="forgot_password">Password Reset Help (Instructions)</option>
                                  <option value="scam_alert">Scam advisory & account recovery instructions</option>
                                  <option value="custom">Custom Support Dispatch Email</option>
                                </select>
                              </div>

                              {autoTemplateType === 'custom' && (
                                <div className="flex flex-col gap-1 text-left">
                                  <label className="font-sans text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">Email Subject Line</label>
                                  <input
                                    type="text"
                                    value={customSubject}
                                    onChange={(e) => setCustomSubject(e.target.value)}
                                    placeholder="Enter custom email subject..."
                                    required
                                    className="w-full bg-[#0A0A0A] border border-brand-borderSubtle rounded-xl px-4 py-2.5 text-white text-xs font-sans focus:border-brand-primary focus:outline-none"
                                  />
                                </div>
                              )}

                              <div className="flex flex-col gap-1 text-left">
                                <label className="font-sans text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">
                                  {autoTemplateType === 'custom' ? 'Custom Body Message' : 'Optional Template Customization Notes'}
                                </label>
                                <textarea
                                  value={customBody}
                                  onChange={(e) => setCustomBody(e.target.value)}
                                  placeholder={autoTemplateType === 'custom' ? "Type your support message here..." : "Include specific details to send with this template..."}
                                  required={autoTemplateType === 'custom'}
                                  rows={4}
                                  className="w-full bg-[#0A0A0A] border border-brand-borderSubtle rounded-xl px-4 py-3 text-white text-xs font-sans focus:border-brand-primary focus:outline-none resize-none"
                                />
                              </div>

                              {dispatchSuccess && (
                                <div className="text-brand-primary bg-brand-primary/10 border border-brand-primary/20 p-3 rounded-xl font-sans text-xs">
                                  {dispatchSuccess}
                                </div>
                              )}

                              <button
                                type="submit"
                                disabled={dispatchingEmail}
                                className="w-full bg-white text-black hover:bg-brand-primary font-bold font-sans text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Send size={13} />
                                <span>{dispatchingEmail ? 'Sending Email...' : 'Dispatch Automated Email'}</span>
                              </button>
                            </form>
                          </div>

                        </div>
                      )}
                    </>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Playlist Songs Detail Popup Overlay */}
      {isPlaylistSongsOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-[500px] bg-[#0A0A0A] border border-brand-borderSubtle rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[75vh] animate-scale-in">
            {/* Header */}
            <div className="p-5 border-b border-brand-borderSubtle bg-brand-bg/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand-primary">
                <PlaySquare size={16} />
                <span className="font-sans font-bold text-white text-sm truncate max-w-[320px]">{selectedPlaylistTitle}</span>
              </div>
              <button 
                onClick={() => setIsPlaylistSongsOpen(false)}
                className="text-brand-textMuted hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Body tracklist */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-2">
              {selectedPlaylistSongs.length > 0 ? (
                selectedPlaylistSongs.map((track, idx) => {
                  const seconds = track.duration || track.duration_seconds;
                  const minutesLabel = seconds ? `${Math.floor(seconds / 60)}:${(seconds % 60 < 10 ? '0' : '')}${Math.floor(seconds % 60)}` : 'N/A';
                  return (
                    <div key={idx} className="flex items-center justify-between gap-4 py-2 border-b border-white/5 hover:bg-white/5 rounded px-2 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded bg-[#111] overflow-hidden shrink-0 border border-white/5">
                          {track.cover_url || track.image ? (
                            <img src={track.cover_url || track.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">🎵</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-sans font-bold text-xs text-white truncate max-w-[260px]">{track.title || track.name}</p>
                          <p className="font-sans text-[10px] text-brand-textMuted truncate max-w-[260px] mt-0.5">{track.artist || track.subtitle}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-brand-textSecondary shrink-0">{minutesLabel}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-brand-textMuted text-xs font-sans italic py-10 text-center">
                  No tracks saved inside this playlist.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details/Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-[500px] bg-[#0A0A0A] border border-brand-borderSubtle rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            style={{
              animation: 'adminFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both'
            }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-brand-borderSubtle bg-brand-bg/40 flex items-center justify-between">
              <span className="font-sans font-bold text-white text-base">Reply Help Ticket</span>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="text-brand-textMuted hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-left">
              
              {/* Ticket Details */}
              <div className="bg-[#111] p-4 rounded-xl border border-brand-borderSubtle">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-sans font-bold text-sm text-white">{selectedTicket.subject}</span>
                  <span className="bg-red-500/10 text-red-400 font-mono text-[9px] uppercase px-2 py-0.5 rounded-full border border-red-500/25">
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-brand-textMuted mt-1.5">
                  <Clock size={11} />
                  <span>Sender: {selectedTicket.email} · {new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
                <p className="font-sans text-xs text-brand-textSecondary leading-relaxed bg-[#0A0A0A] p-3 rounded-xl border border-white/5 mt-4 white-space-pre-wrap">
                  "{selectedTicket.message}"
                </p>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReplyTicket} className="flex flex-col gap-3">
                <label className="font-sans text-xs text-brand-textMuted uppercase tracking-wider font-bold">Write Your Support Response</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your assistance reply here... This message will be sent directly to their email address."
                  required
                  rows={5}
                  className="w-full bg-[#111] border border-brand-borderSubtle rounded-xl px-4 py-3 text-white text-xs font-sans placeholder:text-brand-textMuted focus:border-brand-primary focus:outline-none transition-colors resize-none"
                />

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="bg-brand-primary hover:bg-white text-black font-semibold font-sans text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>{sendingReply ? 'Sending Email...' : 'Send Response & Resolve'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="bg-white/5 text-brand-textSecondary hover:text-white font-sans font-bold text-xs px-5 py-2.5 rounded-xl border border-brand-borderSubtle transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {activeTab !== 'tickets' && <Footer />}

      {/* Global Page Keyframes */}
      <style>{`
        @keyframes drawChartLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
