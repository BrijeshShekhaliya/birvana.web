import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Send, Lock, StickyNote, CheckCircle2, Archive,
  User, UserX, Mail, FileText, ChevronDown, Clock, AlertCircle,
  ArrowUpRight, Loader2, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  'Account Recovery','Login Issue','Password Reset','Scam Recovery','Payment',
  'Subscription','Music Upload','Copyright','Report Abuse','Bug Report',
  'Feature Request','Feedback','Partnership','Technical Issue','General Inquiry','Other'
];
const PRIORITIES = ['Low','Medium','High','Critical'];
const STATUSES   = ['new','waiting_admin','waiting_user','resolved','archived'];

const STATUS_LABEL: Record<string, string> = {
  new: 'New', waiting_admin: 'Waiting for Admin', waiting_user: 'Waiting for User',
  resolved: 'Resolved', archived: 'Archived',
};
const STATUS_COLOR: Record<string, string> = {
  new:           'text-yellow-400 bg-yellow-400/10 border-yellow-400/25',
  waiting_admin: 'text-blue-400 bg-blue-400/10 border-blue-400/25',
  waiting_user:  'text-orange-400 bg-orange-400/10 border-orange-400/25',
  resolved:      'text-green-400 bg-green-400/10 border-green-400/25',
  archived:      'text-gray-500 bg-gray-500/10 border-gray-500/25',
};
const PRIORITY_COLOR: Record<string, string> = {
  Low: 'text-gray-400', Medium: 'text-blue-400', High: 'text-orange-400', Critical: 'text-red-400',
};

interface Message {
  id: string; sender: string; sender_name: string; body: string; created_at: string;
}
interface Note {
  id: string; admin_name: string; note: string; created_at: string;
}
interface Activity {
  id: string; action: string; old_value: string; new_value: string; actor: string; created_at: string;
}
interface CaseData {
  id: string; case_number: number; source: string; user_type: string; user_id: string | null;
  sender_email: string; sender_name: string; subject: string; category: string;
  priority: string; status: string; assigned_to: string | null; created_at: string; updated_at: string;
  profiles?: { id: string; display_name: string; username: string; avatar_url: string; email: string; created_at: string } | null;
}

interface Props {
  caseId: string;
  token: string;
  onUpdated: () => void;
  onBack?: () => void;
}

export const SupportConversation: React.FC<Props> = ({ caseId, token, onUpdated, onBack }) => {
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const [replyBody, setReplyBody] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [sending, setSending] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [showNoteBox, setShowNoteBox] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchCase = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/admin-support?caseId=${caseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      setCaseData(data.case);
      setMessages(data.messages || []);
      setNotes(data.notes || []);
      setActivity(data.activity || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (caseId) fetchCase(); }, [caseId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const updateField = async (field: string, value: string) => {
    setUpdatingField(field);
    try {
      await fetch(`/api/admin-support?caseId=${caseId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value }),
      });
      setCaseData(prev => prev ? { ...prev, [field]: value } : prev);
      onUpdated();
    } catch (e) { console.error(e); }
    finally { setUpdatingField(null); }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || sending) return;
    setSending(true);
    setSuccessMsg('');
    try {
      const resp = await fetch('/api/admin-support-actions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, body: replyBody.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      setMessages(prev => [...prev, data.message]);
      setCaseData(prev => prev ? { ...prev, status: 'waiting_user' } : prev);
      setReplyBody('');
      setSuccessMsg('Reply sent successfully');
      onUpdated();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) { alert(err.message); }
    finally { setSending(false); }
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim() || addingNote) return;
    setAddingNote(true);
    try {
      const resp = await fetch('/api/admin-support-actions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, body: noteBody.trim(), addNote: true }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      setNotes(prev => [...prev, data.note]);
      setNoteBody('');
      setShowNoteBox(false);
    } catch (err: any) { alert(err.message); }
    finally { setAddingNote(false); }
  };

  const fmtTime = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand-textMuted" />
      </div>
    );
  }
  if (!caseData) {
    return (
      <div className="flex-1 flex items-center justify-center text-brand-textMuted text-sm font-sans">
        Case not found.
      </div>
    );
  }

  // Build timeline (messages + notes + activity merged and sorted)
  const timeline = [
    ...messages.map(m => ({ ...m, _type: 'message' as const })),
    ...notes.map(n => ({ ...n, _type: 'note' as const, sender: 'note', body: n.note, sender_name: n.admin_name })),
    ...activity.map(a => ({ ...a, _type: 'activity' as const, sender: 'system', body: `${a.action.replace(/_/g,' ')}: ${a.new_value || ''}`, sender_name: a.actor })),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Top bar */}
      <div className="flex-shrink-0 bg-[#0a0a0a] border-b border-[#1a1a1a] px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {onBack && (
              <button onClick={onBack} className="flex items-center gap-1.5 text-brand-textMuted hover:text-white text-xs mb-2 transition-colors group">
                <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
                Back
              </button>
            )}
            <h2 className="font-sans font-black text-white text-xl leading-tight truncate">{caseData.subject}</h2>
            <p className="font-mono text-sm text-brand-textMuted mt-1">Case #{caseData.case_number} &bull; {fmtTime(caseData.created_at)}</p>
          </div>

          {/* Quick action: mark resolved */}
          {caseData.status !== 'resolved' && caseData.status !== 'archived' && (
            <button
              onClick={() => updateField('status', 'resolved')}
              disabled={updatingField === 'status'}
              className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500 border border-green-500/20 hover:border-transparent text-green-400 hover:text-black font-sans font-bold text-sm px-4 py-2 rounded-xl transition-all shrink-0"
            >
              <CheckCircle2 size={12} />
              Mark Resolved
            </button>
          )}
        </div>

        {/* Summary metadata cards */}
        <div className="flex flex-wrap gap-2 mt-4">
          {/* Status */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-brand-textMuted uppercase tracking-wider">Status</span>
            <select
              value={caseData.status}
              onChange={e => updateField('status', e.target.value)}
              disabled={!!updatingField}
              className={`text-xs font-bold border rounded-xl px-3 py-1.5 bg-transparent focus:outline-none cursor-pointer ${STATUS_COLOR[caseData.status]}`}
            >
              {STATUSES.map(s => <option key={s} value={s} className="bg-[#111] text-white">{STATUS_LABEL[s]}</option>)}
            </select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-brand-textMuted uppercase tracking-wider">Priority</span>
            <select
              value={caseData.priority}
              onChange={e => updateField('priority', e.target.value)}
              disabled={!!updatingField}
              className={`text-xs font-bold border border-white/10 rounded-xl px-3 py-1.5 bg-[#111] focus:outline-none cursor-pointer ${PRIORITY_COLOR[caseData.priority]}`}
            >
              {PRIORITIES.map(p => <option key={p} value={p} className="bg-[#111] text-white">{p}</option>)}
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-brand-textMuted uppercase tracking-wider">Category</span>
            <select
              value={caseData.category}
              onChange={e => updateField('category', e.target.value)}
              disabled={!!updatingField}
              className="text-xs font-bold border border-white/10 rounded-xl px-3 py-1.5 bg-[#111] text-white focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
            </select>
          </div>

          {/* Source */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-brand-textMuted uppercase tracking-wider">Source</span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold border rounded-xl px-3 py-1.5 ${
              caseData.source === 'gmail' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : 'text-green-400 bg-green-400/10 border-green-400/20'
            }`}>
              {caseData.source === 'gmail' ? <Mail size={11} /> : <FileText size={11} />}
              {caseData.source.toUpperCase()}
            </span>
          </div>

          {/* User type */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-brand-textMuted uppercase tracking-wider">User</span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold border rounded-xl px-3 py-1.5 ${
              caseData.user_type === 'registered' ? 'text-brand-primary bg-brand-primary/10 border-brand-primary/20' : 'text-orange-400 bg-orange-400/10 border-orange-400/20'
            }`}>
              {caseData.user_type === 'registered' ? <User size={11} /> : <UserX size={11} />}
              {caseData.user_type === 'registered' ? 'Registered' : 'External'}
            </span>
          </div>
        </div>

        {/* Sender identity card — always shown, based on sender_email not profiles join */}
        <div className={`mt-4 rounded-xl p-3.5 flex items-center gap-3.5 border ${
          caseData.user_type === 'registered'
            ? 'bg-brand-primary/5 border-brand-primary/20'
            : 'bg-orange-400/5 border-orange-400/20'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 border ${
            caseData.user_type === 'registered'
              ? 'bg-brand-primary/20 border-brand-primary/30 text-brand-primary'
              : 'bg-orange-400/10 border-orange-400/20 text-orange-400'
          }`}>
            {(caseData.sender_name || caseData.sender_email).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-sans font-bold text-sm text-white">
              {caseData.sender_name || caseData.sender_email.split('@')[0]}
            </p>
            <p className="font-mono text-xs text-brand-textMuted mt-0.5">
              {caseData.sender_email}
              {caseData.profiles && ` · @${caseData.profiles.username}`}
            </p>
          </div>
          {caseData.user_type === 'registered' && caseData.user_id && (
            <button
              onClick={() => navigate(`/admin/user/${caseData.user_id}`)}
              className="flex items-center gap-1.5 text-brand-primary hover:text-white text-xs font-bold transition-colors shrink-0 px-3 py-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-primary/10"
            >
              View Profile <ExternalLink size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Timeline / conversation */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
        {timeline.map((item, idx) => {
          if (item._type === 'activity') {
            return (
              <div key={idx} className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-[#1a1a1a]" />
                <span className="font-mono text-xs text-brand-textMuted whitespace-nowrap">
                  {item.body} &bull; {fmtTime(item.created_at)}
                </span>
                <div className="h-px flex-1 bg-[#1a1a1a]" />
              </div>
            );
          }

          if (item._type === 'note') {
            return (
              <div key={idx} className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 flex gap-3">
                <StickyNote size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-xs font-bold text-amber-400 mb-2">Internal Note &bull; {item.sender_name} &bull; {fmtTime(item.created_at)}</p>
                  <p className="font-sans text-sm text-amber-200/70 leading-relaxed whitespace-pre-wrap">{item.body}</p>
                </div>
              </div>
            );
          }

          const isAdmin = item.sender === 'admin';
          return (
            <div key={idx} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-black border ${
                isAdmin ? 'bg-brand-primary text-black border-brand-primary/50' : 'bg-[#1a1a1a] text-white border-[#2a2a2a]'
              }`}>
                {isAdmin ? 'A' : (item.sender_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className={`max-w-[75%] ${isAdmin ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                <div className="flex items-center gap-2">
                  <span className="font-sans text-xs font-bold text-brand-textMuted">
                    {isAdmin ? 'Birvana Support' : (item.sender_name || caseData.sender_email)}
                  </span>
                  <span className="font-mono text-xs text-brand-textMuted">{fmtTime(item.created_at)}</span>
                </div>
                <div className={`rounded-2xl px-5 py-3.5 ${
                  isAdmin
                    ? 'bg-brand-primary text-black rounded-tr-sm'
                    : 'bg-[#1a1a1a] text-white border border-[#2a2a2a] rounded-tl-sm'
                }`}>
                  <p className="font-sans text-[15px] leading-relaxed whitespace-pre-wrap">{item.body}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply composer */}
      <div className="flex-shrink-0 border-t border-[#1a1a1a] bg-[#0a0a0a] p-4">
        {successMsg && (
          <div className="flex items-center gap-2 text-brand-primary text-xs font-sans bg-brand-primary/10 border border-brand-primary/20 px-3 py-2 rounded-lg mb-3">
            <CheckCircle2 size={12} /> {successMsg}
          </div>
        )}

        {/* Note box toggle */}
        {showNoteBox ? (
          <form onSubmit={addNote} className="mb-3">
            <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4">
              <p className="font-sans text-xs font-bold text-amber-400 mb-2.5 flex items-center gap-1.5">
                <StickyNote size={12} /> Internal Note — not sent to user
              </p>
              <textarea
                value={noteBody}
                onChange={e => setNoteBody(e.target.value)}
                placeholder="Add a private note for admin reference..."
                rows={3}
                className="w-full bg-transparent text-white text-sm font-sans focus:outline-none resize-none placeholder:text-brand-textMuted"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => setShowNoteBox(false)} className="text-brand-textMuted text-sm font-bold">Cancel</button>
                <button type="submit" disabled={addingNote} className="bg-amber-400/20 text-amber-400 font-bold text-sm px-4 py-1.5 rounded-xl">
                  {addingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>
          </form>
        ) : null}

        <form onSubmit={sendReply} className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              placeholder={`Reply to ${caseData.sender_email}...`}
              rows={3}
              className="w-full bg-[#111] border border-[#222] focus:border-brand-primary rounded-xl px-4 py-3 text-white text-sm font-sans resize-none focus:outline-none transition-colors placeholder:text-brand-textMuted"
            />
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowNoteBox(!showNoteBox)}
              title="Add internal note"
              className="p-2.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-xl hover:bg-amber-400/20 transition-colors"
            >
              <StickyNote size={14} />
            </button>
            <button
              type="submit"
              disabled={sending || !replyBody.trim()}
              className="p-2.5 bg-brand-primary hover:bg-white text-black rounded-xl transition-colors disabled:opacity-40"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
