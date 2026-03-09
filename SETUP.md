# MyBrain Setup Guide

## Quick Start

### 1. Backend (Node.js + Express + SQLite)

```bash
cd /Users/openclaw/.openclaw/workspace/projects/mybrain

# Install dependencies
npm install

# Start backend on port 8081
npm start
```

Backend will output:
```
MyBrain API listening on port 8081
```

Health check:
```bash
curl http://localhost:8081/health
# {"ok":true,"service":"mybrain-api"}
```

### 2. Frontend (React + Vite)

In a **separate terminal**:

```bash
cd /Users/openclaw/.openclaw/workspace/projects/mybrain/src/web

# Install dependencies
npm install

# Start dev server on port 8080
npm run dev
```

Then open: **http://localhost:8080**

### 3. Telegram Integration (Polling Daemon)

In a **third terminal**:

```bash
cd /Users/openclaw/.openclaw/workspace/projects/mybrain

# Start polling daemon
node src/telegram/polling-daemon.js
```

Output:
```
🚀 MyBrain Telegram Polling Daemon started
📱 Polling Telegram API every 2000ms
🧠 Saving to MyBrain backend at http://127.0.0.1:8081/api/entries
💡 Send /mybrain <message> to save to MyBrain
```

## Testing

### Web UI
1. Open http://localhost:8080
2. Enter title, content, tags
3. Click "Add Entry"
4. Search for entries in real-time

### API (cURL)

Create entry:
```bash
curl -X POST http://localhost:8081/api/entries \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"My first entry","tags":["test"]}'
```

List entries:
```bash
curl http://localhost:8081/api/entries
```

Search:
```bash
curl "http://localhost:8081/api/search?q=test"
```

### Telegram

Send to **@my_brain_ayg_bot**:
```
/mybrain Remember to check the dashboard tomorrow
```

You should see in the polling daemon:
```
✅ [2026-03-09T...] Saved: "Remember to check the dashboard tomorrow"
```

Then check it appears in the web UI!

## Environment Variables

Create `.env` (do NOT commit):

```
TELEGRAM_BOT_TOKEN=8532964164:AAG0DoIc7O-fOoT8oHxz_EEUuVRqcrTFlng
PORT=8081
DB_PATH=./data/mybrain.db
FRONTEND_PORT=8080
```

Or use defaults (bot token from docs/TELEGRAM_SETUP.md).

## Database

SQLite database located at: `data/mybrain.db`

Schema:
- `id` (INTEGER PRIMARY KEY)
- `title` (TEXT)
- `content` (TEXT)
- `tags` (TEXT, JSON array)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

## Ports

- **Frontend:** 8080 (React dev server)
- **Backend:** 8081 (Express API)
- **Telegram:** Polling (no port, API-based)

## Troubleshooting

### Backend won't start
```bash
# Check if port 8081 is in use
lsof -i :8081

# Kill process if needed
kill -9 <PID>
```

### Telegram not receiving messages
- Check polling daemon is running
- Verify bot token in `docs/TELEGRAM_SETUP.md`
- Try a test message to @my_brain_ayg_bot
- Check backend is responding: `curl http://localhost:8081/health`

### Frontend shows blank
- Check backend is running on 8081
- Open browser console for errors (F12)
- Try API directly: `curl http://localhost:8081/api/entries`

## Future: Webhook Mode

Currently using polling (reliable, no HTTPS needed).

For webhook mode (lower latency):
1. Set up HTTPS certificate
2. Run: `node src/api/https-proxy.js`
3. Configure Telegram webhook to `https://<your-domain>:8443/api/telegram/message`

See `src/api/https-proxy.js` for details.

## Project Status

✅ **MVP Complete** - All features working:
- Web UI (React)
- REST API (Node.js)
- SQLite Database
- Telegram Integration (Polling)
- Full-text Search
- Real-time Frontend
