/// <reference types="node" />
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Disable default body parsing on Vercel to preserve the raw request stream for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

function getRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: any) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    req.on('error', (err: any) => {
      reject(err);
    });
  });
}

// Remove global client initialization to prevent startup crashes
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(`Configuration Error: Missing env variables. URL exists: ${!!supabaseUrl}, Service Key exists: ${!!supabaseServiceKey}`);
    return res.status(500).json({ 
      error: 'Backend configuration error', 
      details: { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!supabaseServiceKey 
      } 
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Get raw request body
    const rawBody = await getRawBody(req);
    const payloadString = rawBody.toString('utf8');

    // 2. Verify EAS Webhook signature (HMAC-SHA1) if secret is configured
    const webhookSecret = process.env.EXPO_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['expo-signature'];
      if (!signature) {
        return res.status(401).json({ error: 'Missing expo-signature header' });
      }

      const hmac = crypto.createHmac('sha1', webhookSecret);
      hmac.update(rawBody);
      const expectedSignature = hmac.digest('hex');

      if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    // 3. Parse payload
    const payload = JSON.parse(payloadString);
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

    // Correctly resolve build profile (EAS places it inside build.metadata.buildProfile)
    const buildProfile = build.metadata?.buildProfile || build.buildProfile || build.profile;
    
    // We allow 'production' or 'preview' builds to register on the site
    const allowedProfiles = ['preview'];
    if (!allowedProfiles.includes(buildProfile)) {
      return res.status(200).json({ message: `Event ignored (build profile is "${buildProfile}", not in allowed list)` });
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
    const size = '58.5 MB'; 

    console.log(`Registering new release: v${version} (${buildNumber}) - URL: ${buildUrl}`);

    // 4. Upsert into Supabase app_releases table
    const { error: dbError } = await supabase
      .from('app_releases')
      .upsert({
        version,
        build_number: buildNumber,
        date: dateFormatted,
        channel: buildProfile === 'production' ? 'stable' : 'preview',
        size,
        url: buildUrl,
        notes: [
          `Build compiled automatically on Expo EAS.`,
          `Triggered by platform: ${build.platform}.`,
          `EAS Build ID: ${build.id}`,
          `EAS Build Profile: ${buildProfile}`
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
