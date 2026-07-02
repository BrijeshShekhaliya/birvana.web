const handler = require('./api/eas-webhook.ts').default;
const { Readable } = require('stream');

// Mock request and response
const payload = {
  eventType: "build.finished",
  build: {
    platform: "android",
    status: "finished",
    appVersion: "1.1.0",
    appBuildVersion: "3",
    artifacts: {
      buildUrl: "https://example.com"
    },
    metadata: {
      buildProfile: "production"
    }
  }
};

const mockReq = {
  method: 'POST',
  body: payload,
  headers: {
    'expo-signature': 'fake-sig'
  }
};

const mockRes = {
  status(code) {
    console.log('res.status called with:', code);
    return this;
  },
  json(body) {
    console.log('res.json called with:', body);
    return this;
  }
};

async function test() {
  try {
    await handler(mockReq, mockRes);
  } catch (err) {
    console.error('Handler threw error:', err);
  }
}

test();
