# MyBrain Telegram Webhook Integration

**Status:** Using OpenClaw message routing (more reliable than polling)

## How It Works

1. Telegram message arrives → OpenClaw gateway receives it
2. OpenClaw detects `/mybrain` command
3. Triggers MyBrain handler → saves to database
4. User gets confirmation

## Setup (OpenClaw Integration)

### Option 1: Cron Job (Recommended)

Create a cron job that checks for incoming messages:

```bash
openclaw cron add \
  --schedule="cron" \
  --expr="* * * * *" \
  --payload-kind="systemEvent" \
  --payload-text="check-mybrain-messages" \
  --session-target="isolated"
```

### Option 2: Message Handler Hook

In OpenClaw's telegram plugin config:
- Route messages starting with `/mybrain` → MyBrain handler
- Call: `/Users/openclaw/.openclaw/workspace/projects/mybrain/src/telegram/handler.js`

### Option 3: Webhook (Direct)

If you have HTTPS on port 443:

```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-domain.com/api/telegram/webhook"}'
```

MyBrain backend already has the endpoint:
```
POST /api/telegram/message
```

## Current Implementation

**Backend endpoint:** `POST /api/telegram/message`

Accepts:
```json
{
  "text": "/mybrain My thought here"
}
```

Returns:
```json
{
  "handled": true,
  "ok": true,
  "message": "✅ Saved: ...",
  "entry": { "id": 1, "content": "..." }
}
```

## Testing

### Manual API Test
```bash
curl -X POST http://localhost:8081/api/telegram/message \
  -H "Content-Type: application/json" \
  -d '{"text":"/mybrain Test from API"}'
```

Expected response:
```json
{
  "handled": true,
  "ok": true,
  "message": "✅ Saved: \"Test from API\"",
  "entry": { "id": 1, "content": "Test from API", ... }
}
```

### Via Telegram Bot
Send to @my_brain_ayg_bot:
```
/mybrain Remember to update dashboard
```

If using polling daemon:
```bash
node src/telegram/polling-daemon.js
```

## Architecture

```
Telegram (@my_brain_ayg_bot)
    ↓
OpenClaw Gateway (receives messages)
    ↓
Detects /mybrain command
    ↓
POST to /api/telegram/message
    ↓
MyBrain Backend (saves to SQLite)
    ↓
React Frontend (displays in list)
```

## No Polling Needed

The polling daemon (`src/telegram/polling-daemon.js`) is optional.

For production, use **OpenClaw's native Telegram integration** which:
- Receives messages automatically
- More efficient than polling
- Built-in retry logic
- No extra process needed

## Configuration

None needed — bot is already created and backend is ready.

Bot details:
- Handle: `@my_brain_ayg_bot`
- Token: `8532964164:AAG0DoIc7O-fOoT8oHxz_EEUuVRqcrTFlng`
- Command: `/mybrain <message>`

Just make sure backend is running:
```bash
npm start  # port 8081
```

And route messages to it:
```bash
curl -X POST http://localhost:8081/api/telegram/message \
  -H "Content-Type: application/json" \
  -d '{"text":"/mybrain Your message"}'
```

Done! 🎉
