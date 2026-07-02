import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client using Service Role key to bypass RLS for write access
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Verify EAS Webhook signature if secret is configured
    const webhookSecret = process.env.EXPO_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['expo-signature'];
      if (!signature) {
        return res.status(401).json({ error: 'Missing expo-signature header' });
      }

      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
      const expectedSignature = `sha256=${hmac.digest('hex')}`;

      if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    // 2. Parse payload
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { eventType, build } = payload;

    console.log(`Received EAS Webhook event: ${eventType}`);

    // We only care about completed Android builds
    if (eventType !== 'build.finished') {
      return res.status(200).json({ message: 'Event ignored (not build.finished)' });
    }

    if (build.platform !== 'android') {
      return res.status(200).json({ message: 'Event ignored (not Android platform)' });
    }

    if (build.status !== 'finished') {
      return res.status(200).json({ message: `Event ignored (build status is ${build.status})` });
    }

    // Only update website if the build profile is explicitly 'production'
    // This ignores preview/testing builds (like development or internal testing)
    if (build.profile !== 'production') {
      return res.status(200).json({ message: `Event ignored (build profile is "${build.profile}", not "production")` });
    }

    const version = build.appVersion;
    const buildNumber = parseInt(build.appBuildVersion, 10) || 1;
    const buildUrl = build.artifacts?.buildUrl;

    if (!buildUrl) {
      return res.status(400).json({ error: 'No build URL found in artifacts' });
    }

    const dateFormatted = new Date(build.completedAt || build.createdAt || Date.now())
      .toISOString()
      .split('T')[0];

    // Estimate file size if not provided by EAS (EAS doesn't always expose exact size directly in root payload)
    const size = '112.5 MB'; 

    console.log(`Registering new release: v${version} (${buildNumber}) - URL: ${buildUrl}`);

    // 3. Upsert into Supabase app_releases table
    // If the version and build number already exists, update it, otherwise insert new
    const { error: dbError } = await supabase
      .from('app_releases')
      .upsert({
        version,
        build_number: buildNumber,
        date: dateFormatted,
        channel: build.sdkVersion ? 'stable' : 'preview',
        size,
        url: buildUrl,
        notes: [
          `Build compiled automatically on Expo EAS.`,
          `Triggered by platform: ${build.platform}.`,
          `EAS Build ID: ${build.id}`
        ]
      }, {
        onConflict: 'version,build_number'
      });

    if (dbError) {
      throw dbError;
    }

    return res.status(200).json({ success: true, message: 'Release updated in database successfully.' });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
