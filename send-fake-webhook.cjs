const crypto = require('crypto');
const http = require('https');

const secret = 'birvana_expo_secret_2026';
const url = 'birvana.indevs.in';
const path = '/api/eas-webhook';

const payload = {
  id: "fake-event-id-" + Math.floor(Math.random() * 1000),
  eventType: "build.finished",
  project: {
    id: "d71bb4b4-2313-4a93-8734-54c894b4d6e9",
    slug: "birvana-mobile",
    owner: "brijesh_shekhaliya"
  },
  build: {
    id: "fake-build-id-" + Math.floor(Math.random() * 1000),
    status: "finished",
    platform: "android",
    appVersion: "1.1.0", // Fake new version to verify update
    appBuildVersion: "3", // Fake new build number
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    artifacts: {
      buildUrl: "https://github.com/BrijeshShekhaliya/birvana-app/releases/download/v1.0.0/Birvana.apk" // Real APK for direct download link
    },
    metadata: {
      buildProfile: "production"
    }
  }
};

const payloadString = JSON.stringify(payload);

// Calculate signature (HMAC-SHA1 hex digest)
const hmac = crypto.createHmac('sha1', secret);
hmac.update(payloadString);
const signature = hmac.digest('hex');

console.log('Sending fake EAS webhook to:', `https://${url}${path}`);
console.log('Payload:', JSON.stringify(payload, null, 2));
console.log('Calculated Signature:', signature);

const options = {
  hostname: url,
  port: 443,
  path: path,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'expo-signature': signature,
    'Content-Length': Buffer.byteLength(payloadString)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('\n--- Webhook Response ---');
    console.log('Status Code:', res.statusCode);
    console.log('Body:', data);
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(payloadString);
req.end();
