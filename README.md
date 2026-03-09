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

## Quick Start

### Frontend (React + Vite)
```bash
cd src/web
npm install
npm run dev
# Runs on http://localhost:8080
# Proxies /api requests to localhost:8081
```

### Backend (Node.js + Express + SQLite)
```bash
npm install
npm start
# Runs on http://localhost:8081
# POST /api/entries - create entry
# GET /api/entries - list all
# GET /api/search?q=query - search
```

### Telegram Integration
- Bot: @my_brain_ayg_bot
- Command: `/mybrain <message>` saves to database
- Token stored in `.env` (do not commit)

## Status

✅ **MVP Complete** — Backend API + React frontend + Telegram integration fully functional.
- Frontend: React 18 + TypeScript + Vite + Tailwind
- Backend: Node.js + Express + SQLite
- Telegram: Webhook handler for /mybrain commands
- Ports: Frontend 8080, Backend 8081
