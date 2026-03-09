# MyBrain API & Telegram Webhook

## REST API Endpoints

### Create Entry
```
POST /api/entries
Content-Type: application/json

{
  "title": "string (optional)",
  "content": "string (required)",
  "tags": ["string"]
}
```

Response:
```json
{
  "id": 1,
  "title": "My Idea",
  "content": "This is my thought",
  "tags": ["important"],
  "created_at": "2026-03-09T11:50:16Z",
  "updated_at": "2026-03-09T11:50:16Z"
}
```

### List All Entries
```
GET /api/entries
```

Response:
```json
[
  {
    "id": 1,
    "title": "My Idea",
    "content": "This is my thought",
    "tags": ["important"],
    "created_at": "2026-03-09T11:50:16Z"
  },
  ...
]
```

### Search Entries
```
GET /api/search?q=dashboard
```

Response:
```json
[
  {
    "id": 2,
    "title": "Dashboard Update",
    "content": "Remember to update the dashboard tomorrow",
    ...
  }
]
```

### Delete Entry
```
DELETE /api/entries/:id
```

## Telegram Webhook Endpoint

### POST /api/telegram/message

This endpoint receives Telegram messages and saves them automatically.

**Request:**
```json
{
  "text": "/mybrain Remember to check metrics"
}
```

**Response (success):**
```json
{
  "handled": true,
  "ok": true,
  "message": "✅ Saved: \"Remember to check metrics\"",
  "entry": {
    "id": 3,
    "content": "Remember to check metrics",
    "created_at": "2026-03-09T11:50:16Z"
  }
}
```

**Response (not a mybrain command):**
```json
{
  "handled": false
}
```

## Integration Options

### Option 1: Polling (Current - Reliable ✅)

The polling daemon (`src/telegram/polling-daemon.js`) checks Telegram API every 2 seconds:

```bash
node src/telegram/polling-daemon.js
```

✅ **Pros:**
- No HTTPS required
- No port restrictions
- Simple, reliable
- Works behind NAT/firewalls

❌ **Cons:**
- Slight delay (2-5 seconds)
- Continuous API calls

### Option 2: OpenClaw Message Routing (Recommended for Production)

OpenClaw's Telegram plugin can automatically route messages:

```bash
# Set up a handler that calls /api/telegram/message when messages arrive
# This would be configured in openclaw.json's telegram plugin
```

**Config:**
```json
{
  "channels": {
    "telegram": {
      "hooks": {
        "onMessage": {
          "url": "http://localhost:8081/api/telegram/message"
        }
      }
    }
  }
}
```

✅ **Pros:**
- Instant (no polling delay)
- Lower overhead
- Built-in retry logic

### Option 3: Telegram Webhook (Production - Requires HTTPS)

Set up HTTPS on port 443 and register webhook:

```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/telegram/message",
    "allowed_updates": ["message"]
  }'
```

❌ **Cons:**
- Requires HTTPS certificate
- Telegram must reach your server
- More complex setup

## Testing

### Test via cURL
```bash
# Create entry via API
curl -X POST http://localhost:8081/api/entries \
  -H "Content-Type: application/json" \
  -d '{"title":"API Test","content":"Created via curl","tags":["test"]}'

# List entries
curl http://localhost:8081/api/entries

# Search
curl "http://localhost:8081/api/search?q=test"

# Simulate Telegram message
curl -X POST http://localhost:8081/api/telegram/message \
  -H "Content-Type: application/json" \
  -d '{"text":"/mybrain My idea from curl"}'
```

### Test via Telegram
Send to **@my_brain_ayg_bot**:
```
/mybrain Remember this important thing
```

Watch it appear in the web UI: **http://localhost:8080**

## Architecture

```
┌─────────────┐
│  Telegram   │
│ @my_brain   │
└──────┬──────┘
       │
       ├─ Option 1: Polling Daemon (⭐ current)
       │     node src/telegram/polling-daemon.js
       │     │
       │     └─→ getUpdates() every 2s
       │
       ├─ Option 2: OpenClaw Hook
       │     telegram.onMessage → /api/telegram/message
       │
       └─ Option 3: Telegram Webhook
             setWebhook → /api/telegram/message (HTTPS)
       │
       └──→ POST /api/telegram/message
            │
            └──→ MyBrain Backend (port 8081)
                 │
                 └──→ SQLite Database
                      │
                      └──→ React Frontend (port 8080)
```

## Default Configuration

- **Backend:** http://localhost:8081
- **Frontend:** http://localhost:8080
- **Telegram Bot:** @my_brain_ayg_bot
- **Polling Interval:** 2 seconds (if using polling daemon)
- **Database:** ./data/mybrain.db (SQLite)

## Running Everything

```bash
# Terminal 1: Backend API
cd /Users/openclaw/.openclaw/workspace/projects/mybrain
npm start

# Terminal 2: Frontend
cd src/web && npm run dev

# Terminal 3: Telegram Polling (optional, only if not using OpenClaw hooks)
node src/telegram/polling-daemon.js
```

Then:
- Web UI: http://localhost:8080
- API: http://localhost:8081/health
- Telegram: @my_brain_ayg_bot → /mybrain <message>
