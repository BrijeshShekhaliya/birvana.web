import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Filter, RefreshCw, Mail, FileText, Circle, CheckCircle2, Archive, User, UserX, Inbox
} from 'lucide-react';

const CATEGORIES = [
  'Account Recovery','Login Issue','Password Reset','Scam Recovery','Payment',
  'Subscription','Music Upload','Copyright','Report Abuse','Bug Report',
  'Feature Request','Feedback','Partnership','Technical Issue','General Inquiry','Other'
];
const PRIORITIES = ['Low','Medium','High','Critical'];
const STATUSES = ['new','waiting_admin','waiting_user','resolved','archived'];

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new:           { label: 'New',               color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', icon: <Circle size={10} className="fill-yellow-400 text-yellow-400" /> },
  waiting_admin: { label: 'Waiting for Admin', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',   icon: <Circle size={10} className="fill-blue-400 text-blue-400" /> },
  waiting_user:  { label: 'Waiting for User',  color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', icon: <Circle size={10} className="fill-orange-400 text-orange-400" /> },
  resolved:      { label: 'Resolved',          color: 'text-green-400 bg-green-400/10 border-green-400/20',  icon: <CheckCircle2 size={10} className="text-green-400" /> },
  archived:      { label: 'Archived',          color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',    icon: <Archive size={10} className="text-gray-500" /> },
};

const PRIORITY_META: Record<string, { color: string }> = {
  Low:      { color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
  Medium:   { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  High:     { color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  Critical: { color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

interface SupportCase {
  id: string;
  case_number: number;
  source: 'form' | 'gmail';
  user_type: 'registered' | 'external';
  user_id: string | null;
  sender_email: string;
  sender_name: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  unread: boolean;
  created_at: string;
  updated_at: string;
  profiles?: { display_name: string; username: string; avatar_url: string } | null;
}

interface Props {
  token: string;
  onSelectCase: (c: SupportCase) => void;
  selectedCaseId: string | null;
  refreshTrigger: number;
}

export const SupportInbox: React.FC<Props> = ({ token, onSelectCase, selectedCaseId, refreshTrigger }) => {
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [unread, setUnread] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeout = useRef<any>(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      if (search.trim()) params.set('search', search.trim());
      const resp = await fetch(`/api/admin-support?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      setCases(data.cases || []);
      setUnread(data.unread || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, statusFilter, sourceFilter, priorityFilter, search]);

  useEffect(() => { fetchCases(); }, [fetchCases, refreshTrigger]);

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(fetchCases, 400);
  };

  const syncGmail = async () => {
    setSyncing(true);
    try {
      await fetch('/api/admin-support-actions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'gmail_sync' }),
      });
      await fetchCases();
    } catch (e) { console.error(e); }
    finally { setSyncing(false); }
  };

  const timeAgo = (iso: string) => {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-[#1a1a1a]">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-[#1a1a1a] flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Inbox size={20} className="text-brand-primary" />
            <span className="font-sans font-black text-base text-white">Support Cases</span>
            {unread > 0 && (
              <span className="bg-brand-primary text-black text-xs font-black px-2 py-0.5 rounded-full">{unread}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-white/10 text-white' : 'text-brand-textMuted hover:text-white hover:bg-white/5'}`}
              title="Filters"
            >
              <Filter size={16} />
            </button>
            <button
              onClick={syncGmail}
              disabled={syncing}
              className="p-2 text-brand-textMuted hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              title="Sync Gmail"
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-textMuted" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by email, subject..."
            className="w-full bg-[#111] border border-[#222] rounded-xl pl-10 pr-4 py-3 text-white text-sm font-sans placeholder:text-brand-textMuted focus:border-brand-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-3 gap-2 animate-fade-in">
            {[
              { label: 'Status', value: statusFilter, set: setStatusFilter, options: ['all', ...STATUSES] },
              { label: 'Source', value: sourceFilter, set: setSourceFilter, options: ['all', 'form', 'gmail'] },
              { label: 'Priority', value: priorityFilter, set: setPriorityFilter, options: ['all', ...PRIORITIES] },
            ].map(f => (
              <select
                key={f.label}
                value={f.value}
                onChange={e => { f.set(e.target.value); }}
                className="bg-[#111] border border-[#222] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary capitalize cursor-pointer"
              >
                {f.options.map(o => (
                  <option key={o} value={o}>{o === 'all' ? `All ${f.label}s` : o.replace('_', ' ')}</option>
                ))}
              </select>
            ))}
          </div>
        )}
      </div>

      {/* Cases list */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#111] rounded-2xl p-4 animate-pulse border border-white/5">
                <div className="h-4 bg-[#1a1a1a] rounded w-3/4 mb-3" />
                <div className="h-3 bg-[#1a1a1a] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center gap-3 px-6">
            <Inbox size={40} className="text-brand-textMuted" />
            <p className="font-sans text-sm text-brand-textMuted">No cases found</p>
            <button onClick={syncGmail} className="text-brand-primary text-sm font-bold hover:underline">Sync Gmail Inbox</button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {cases.map(c => {
              const sm = STATUS_META[c.status];
              const pm = PRIORITY_META[c.priority];
              const isSelected = c.id === selectedCaseId;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${
                    isSelected
                      ? 'bg-brand-primary/10 border-brand-primary/45 shadow-[0_4px_20px_rgba(29,185,84,0.05)]'
                      : 'bg-[#0f0f0f]/40 border-[#1c1c1c] hover:bg-[#151515] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {c.unread && !isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-primary shrink-0 animate-pulse" />
                      )}
                      <span className="font-sans font-bold text-sm text-white truncate">
                        {c.sender_name || c.sender_email}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-brand-textMuted shrink-0">{timeAgo(c.updated_at)}</span>
                  </div>

                  <p className="font-sans text-xs text-brand-textSecondary truncate mb-3">{c.subject}</p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Source badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                      c.source === 'gmail' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : 'text-green-400 bg-green-400/10 border-green-400/20'
                    }`}>
                      {c.source === 'gmail' ? <Mail size={8} /> : <FileText size={8} />}
                      {c.source.toUpperCase()}
                    </span>

                    {/* User type */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      c.user_type === 'registered' ? 'text-brand-primary bg-brand-primary/10 border-brand-primary/20' : 'text-orange-400 bg-orange-400/10 border-orange-400/20'
                    }`}>
                      {c.user_type === 'registered' ? <User size={8} /> : <UserX size={8} />}
                      {c.user_type === 'registered' ? 'REG' : 'EXT'}
                    </span>

                    {/* Status */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${sm.color}`}>
                      {sm.icon}
                      {sm.label}
                    </span>

                    {/* Priority */}
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${pm.color}`}>
                      {c.priority}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
