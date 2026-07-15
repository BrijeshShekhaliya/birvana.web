import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, verifyUser } from './_db.js';

const ADMIN_EMAIL = 'birvana.official.in@gmail.com';

async function assertAdmin(req: VercelRequest) {
  const user = await verifyUser(req);
  if (user.email?.toLowerCase() !== ADMIN_EMAIL) throw new Error('Admin only');
  return user;
}

// ─── LIST CASES ──────────────────────────────────────────────────────────────
async function listCases(req: VercelRequest, res: VercelResponse) {
  const { status, source, category, priority, user_type, search, page = '1', limit = '30' } = req.query as Record<string, string>;

  let query = supabase
    .from('support_cases')
    .select(`id, case_number, source, user_type, user_id, sender_email, sender_name,
      subject, category, priority, status, assigned_to, unread,
      created_at, updated_at, resolved_at,
      profiles:user_id ( display_name, username, avatar_url )`)
    .order('updated_at', { ascending: false });

  if (status && status !== 'all') query = query.eq('status', status);
  if (source && source !== 'all') query = query.eq('source', source);
  if (category && category !== 'all') query = query.eq('category', category);
  if (priority && priority !== 'all') query = query.eq('priority', priority);
  if (user_type && user_type !== 'all') query = query.eq('user_type', user_type);
  if (search) query = query.or(`sender_email.ilike.%${search}%,sender_name.ilike.%${search}%,subject.ilike.%${search}%`);

  const pageNum = parseInt(page) - 1;
  const limitNum = parseInt(limit);
  query = query.range(pageNum * limitNum, pageNum * limitNum + limitNum - 1);

  const { data, error } = await query;
  if (error) throw error;

  const { count: unreadCount } = await supabase
    .from('support_cases').select('*', { count: 'exact', head: true })
    .eq('unread', true).not('status', 'in', '("resolved","archived")');

  return res.status(200).json({ cases: data || [], unread: unreadCount || 0 });
}

// ─── GET CASE DETAIL ─────────────────────────────────────────────────────────
async function getCaseDetail(req: VercelRequest, res: VercelResponse) {
  const { caseId } = req.query as Record<string, string>;
  if (!caseId) return res.status(400).json({ error: 'Missing caseId' });

  const [caseRes, msgsRes, notesRes, activityRes] = await Promise.all([
    supabase.from('support_cases')
      .select('*, profiles:user_id ( id, display_name, username, avatar_url, email, created_at )')
      .eq('id', caseId).single(),
    supabase.from('support_messages').select('*').eq('case_id', caseId).order('created_at', { ascending: true }),
    supabase.from('support_notes').select('*').eq('case_id', caseId).order('created_at', { ascending: true }),
    supabase.from('support_activity').select('*').eq('case_id', caseId).order('created_at', { ascending: true }),
  ]);

  if (caseRes.error) return res.status(404).json({ error: 'Case not found' });
  await supabase.from('support_cases').update({ unread: false }).eq('id', caseId);

  return res.status(200).json({
    case: caseRes.data,
    messages: msgsRes.data || [],
    notes: notesRes.data || [],
    activity: activityRes.data || [],
  });
}

// ─── PATCH CASE FIELD ────────────────────────────────────────────────────────
async function patchCase(req: VercelRequest, res: VercelResponse) {
  const { caseId } = req.query as Record<string, string>;
  if (!caseId) return res.status(400).json({ error: 'Missing caseId' });

  const { field, value } = req.body;
  const allowed = ['status', 'category', 'priority', 'assigned_to'];
  if (!field || !allowed.includes(field)) return res.status(400).json({ error: 'Invalid field' });

  const { data: current } = await supabase.from('support_cases').select(field).eq('id', caseId).single();
  const oldValue = current?.[field];

  const updateData: Record<string, any> = { [field]: value };
  if (field === 'status' && value === 'resolved') updateData.resolved_at = new Date().toISOString();

  const { error } = await supabase.from('support_cases').update(updateData).eq('id', caseId);
  if (error) throw error;

  await supabase.from('support_activity').insert({
    case_id: caseId, action: `${field}_changed`, old_value: oldValue, new_value: value, actor: 'Admin',
  });

  return res.status(200).json({ success: true });
}

// ─── MAIN HANDLER ────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try { await assertAdmin(req); }
  catch { return res.status(401).json({ error: 'Unauthorized' }); }

  try {
    if (req.method === 'GET') {
      const { caseId } = req.query as Record<string, string>;
      return caseId ? getCaseDetail(req, res) : listCases(req, res);
    }
    if (req.method === 'PATCH') return patchCase(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('admin-support error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
