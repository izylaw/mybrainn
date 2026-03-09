#!/usr/bin/env node

/**
 * HTTPS Proxy for Telegram Webhooks
 * 
 * Telegram webhooks require HTTPS on ports 80, 88, 443, or 8443.
 * This server proxies HTTPS port 8443 -> HTTP localhost:8081
 * 
 * Usage:
 *   node src/api/https-proxy.js
 *   
 * For self-signed certificate (testing):
 *   openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HTTPS_PORT = 8443;
const BACKEND_HOST = '127.0.0.1';
const BACKEND_PORT = 8081;

// Try to load certificate. If not found, create self-signed for testing
const certPath = path.join(__dirname, '../../cert.pem');
const keyPath = path.join(__dirname, '../../key.pem');

let cert, key;

try {
  cert = fs.readFileSync(certPath);
  key = fs.readFileSync(keyPath);
  console.log('✅ Using existing certificate');
} catch (e) {
  console.warn('⚠️  No certificate found. For production, provide cert.pem and key.pem');
  console.log('For testing with self-signed:');
  console.log('  openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365');
  process.exit(1);
}

// Create HTTPS server that proxies to backend
const httpsServer = https.createServer({ cert, key }, (req, res) => {
  // Proxy request to backend
  const proxyReq = http.request(
    {
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (e) => {
    console.error('Backend error:', e.message);
    res.writeHead(503);
    res.end('Backend unavailable');
  });

  req.pipe(proxyReq);
});

httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS Proxy listening on port ${HTTPS_PORT}`);
  console.log(`Proxying to ${BACKEND_HOST}:${BACKEND_PORT}`);
  console.log(`Telegram webhook URL: https://<your-domain>:${HTTPS_PORT}/api/telegram/message`);
});
