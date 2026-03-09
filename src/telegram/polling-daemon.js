#!/usr/bin/env node

/**
 * MyBrain Telegram Polling Daemon
 * 
 * Polls Telegram API for /mybrain commands and saves to MyBrain backend.
 * Runs continuously, checking every 2 seconds.
 * 
 * Usage:
 *   node src/telegram/polling-daemon.js &
 *   
 * To stop:
 *   kill %1
 */

const https = require('https');
const http = require('http');
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8532964164:AAG0DoIc7O-fOoT8oHxz_EEUuVRqcrTFlng';
const POLL_INTERVAL = 2000; // 2 seconds
const BACKEND_URL = 'http://127.0.0.1:8081/api/entries';

let lastUpdateId = 0;
const processedUpdates = new Set(); // Prevent duplicates

async function getUpdates() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&allowed_updates=["message"]`,
      method: 'GET',
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.ok && json.result && json.result.length > 0) {
            resolve(json.result);
          } else {
            resolve([]);
          }
        } catch (e) {
          console.error('Parse error:', e.message);
          resolve([]);
        }
      });
    }).on('error', reject).end();
  });
}

function saveToMyBrain(update) {
  const message = update.message;
  if (!message || !message.text) return;

  const text = message.text.trim();
  if (!text.startsWith('/mybrain')) return;

  // Extract content
  const content = text.slice('/mybrain'.length).trim();
  if (!content) return;

  const userId = message.from.id;
  const userName = message.from.first_name || 'Unknown';

  const payload = JSON.stringify({
    title: `${userName} (Telegram)`,
    content: content,
    tags: ['telegram', `user-${userId}`],
  });

  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 8081,
        path: '/api/entries',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length,
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 201) {
            console.log(`✅ [${new Date().toISOString()}] Saved: "${content.slice(0, 40)}..."`);
          } else {
            console.error(`❌ Error: ${res.statusCode}`, data);
          }
          resolve();
        });
      }
    );

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      resolve();
    });

    req.write(payload);
    req.end();
  });
}

async function poll() {
  try {
    const updates = await getUpdates();

    for (const update of updates) {
      // Skip duplicates
      if (processedUpdates.has(update.update_id)) continue;
      processedUpdates.add(update.update_id);

      // Update highest ID for next poll
      if (update.update_id > lastUpdateId) {
        lastUpdateId = update.update_id;
      }

      // Process if it's a /mybrain message
      if (update.message && update.message.text && update.message.text.includes('/mybrain')) {
        await saveToMyBrain(update);
      }
    }
  } catch (e) {
    console.error('Poll error:', e.message);
  }

  // Schedule next poll
  setTimeout(poll, POLL_INTERVAL);
}

console.log('🚀 MyBrain Telegram Polling Daemon started');
console.log(`📱 Polling Telegram API every ${POLL_INTERVAL}ms`);
console.log(`🧠 Saving to MyBrain backend at ${BACKEND_URL}`);
console.log('💡 Send /mybrain <message> to save to MyBrain\n');

// Start polling
poll();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✋ Shutting down...');
  process.exit(0);
});
