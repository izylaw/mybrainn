#!/usr/bin/env node

/**
 * MyBrain Telegram Webhook Bridge
 * 
 * Routes OpenClaw Telegram messages to MyBrain backend API.
 * Can be called from OpenClaw cron or message handlers.
 * 
 * Usage:
 *   node webhook-bridge.js "user_id" "/mybrain My thought here"
 */

const http = require('http');

const [, , userId, messageText] = process.argv;

if (!messageText || !messageText.startsWith('/mybrain')) {
  console.log('Not a /mybrain command, skipping');
  process.exit(0);
}

// Extract message content (remove '/mybrain ' prefix)
const content = messageText.slice('/mybrain '.length).trim();

if (!content) {
  console.log('Empty message, skipping');
  process.exit(0);
}

// Send to MyBrain backend
const payload = JSON.stringify({
  title: `Telegram: ${new Date().toISOString()}`,
  content: content,
  tags: ['telegram', `user-${userId}`]
});

const options = {
  hostname: '127.0.0.1',
  port: 8081,
  path: '/api/entries',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const entry = JSON.parse(data);
      console.log(`✅ Saved to MyBrain: "${content.slice(0, 50)}..."`);
      console.log(`Entry ID: ${entry.id}`);
    } catch (e) {
      console.error('❌ Failed to save:', data);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Connection error:', e.message);
  process.exit(1);
});

req.write(payload);
req.end();
