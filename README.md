# MyBrain — Personal Knowledge Capture

A simple, distraction-free way to capture ideas, thoughts, and memories.

## Goal

Store anything you want to remember:
- Ideas and insights
- Personal notes and reflections  
- Things to remember or explore later
- Quick captures from anywhere (web UI or Telegram)

## MVP Features

### Web UI
- Form to input title, content, optional tags
- Simple list view of all entries
- Full-text search
- Basic metadata (date created, updated)
- Clean, minimal design

### Telegram Integration
- Command-based input: `/mybrain My quick thought` or hashtag `#mybrain my thought`
- Confirmation of save
- Optional: /mybrain search <query>

### Storage
- SQLite database (local-first, no external dependencies)
- Simple schema: id, title, content, tags, created_at, updated_at

## Tech Stack (Suggested)

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + better-sqlite3
- **Telegram:** OpenClaw's message gateway + webhook handler

## Project Structure

```
mybrain/
├── README.md          (this file)
├── docs/
│   ├── REQUIREMENTS.md
│   ├── API.md
│   └── TELEGRAM_SETUP.md
└── src/
    ├── web/           (frontend)
    ├── api/           (backend)
    └── telegram/      (bot handler)
```

## Next Steps

1. **Requirements Review** — Refine feature scope with Aygun
2. **Architecture Design** — Database schema, API design
3. **Frontend** — Web form + list + search
4. **Backend** — API endpoints, SQLite setup
5. **Telegram** — Bot command handler + webhook
6. **Testing & Launch**

## Status

🚀 Ready for implementation. Awaiting team assignment.
