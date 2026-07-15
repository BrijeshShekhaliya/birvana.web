import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, verifyUser } from './_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Authenticate user
    const user = await verifyUser(req);
    const email = user.email || '';

    // 2. Authorize admin
    if (email.toLowerCase() !== 'birvana.official.in@gmail.com') {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    // 3. Fetch data from Supabase in parallel
    const [profilesRes, streamsRes, likesRes, ticketsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_recent_plays').select('user_id', { count: 'exact' }),
      supabase.from('user_liked_songs').select('user_id', { count: 'exact' }),
      supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
    ]);

    if (profilesRes.error) throw profilesRes.error;
    if (ticketsRes.error) throw ticketsRes.error;

    const profiles = profilesRes.data || [];
    const tickets = ticketsRes.data || [];
    const totalUsers = profiles.length;
    const totalStreams = streamsRes.count || 0;
    const totalLikes = likesRes.count || 0;
    const pendingTickets = tickets.filter(t => t.status === 'pending').length;

    // 4. Calculate registrations trend for the last 7 days
    const trendMap: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      trendMap[dateStr] = 0;
    }

    profiles.forEach(p => {
      if (p.created_at) {
        const dateStr = p.created_at.split('T')[0];
        if (trendMap[dateStr] !== undefined) {
          trendMap[dateStr]++;
        }
      }
    });

    const userTrends = Object.keys(trendMap).map(date => ({
      date,
      count: trendMap[date]
    })).sort((a, b) => a.date.localeCompare(b.date));

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStreams,
        totalLikes,
        pendingTickets
      },
      userTrends,
      users: profiles,
      tickets
    });
  } catch (error: any) {
    console.error('Error in admin-get-stats:', error);
    return res.status(error.message?.startsWith('Unauthorized') ? 401 : 500).json({ error: error.message || 'Internal server error' });
  }
}
