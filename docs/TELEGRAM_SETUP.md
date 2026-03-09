# MyBrain Telegram Bot Setup

## Bot Details

- **Bot Handle:** @my_brain_ayg_bot
- **Link:** https://t.me/my_brain_ayg_bot
- **Created:** 2026-03-09

## Configuration

### Token (Keep Secure)

Store in environment variable or `.env` file (DO NOT commit to Git):

```
TELEGRAM_BOT_TOKEN=8532964164:AAG0DoIc7O-fOoT8oHxz_EEUuVRqcrTFlng
```

## Commands

### /mybrain <message>
Save a thought/idea to MyBrain database.

Example:
```
/mybrain Remember to review financial dashboard redesign
```

Bot response: ✅ Saved to MyBrain

### Future Commands (Phase 2+)
- `/search <query>` — Search entries
- `/list` — Show recent entries
- `/export` — Export all entries

## Integration

**Backend handler location:** `/src/api/telegram.js` (or similar)

**Required:**
- Webhook endpoint to receive Telegram updates
- Parse `/mybrain` command + message text
- Extract user ID and message
- Insert into database with `created_at` timestamp
- Reply with confirmation

**OpenClaw Gateway Integration:**
- Use OpenClaw's message tool to handle incoming Telegram messages
- Route through gateway, not direct polling

## References

- Telegram Bot API: https://core.telegram.org/bots/api
- Command handling: https://core.telegram.org/bots#commands
- Webhook setup: https://core.telegram.org/bots/webhooks

## Status

🚀 Ready for backend integration (Bill's task)
