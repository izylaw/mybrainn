# MyBrain Backend API

Base URL: `http://localhost:3001`

## Database Schema

SQLite DB file: `data/mybrain.db`

### `entries`

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| title | TEXT | Optional title |
| content | TEXT | Required body/content |
| tags | TEXT | JSON array string (e.g. `"[\"idea\",\"infra\"]"`) |
| created_at | DATETIME | Default `CURRENT_TIMESTAMP` |
| updated_at | DATETIME | Default `CURRENT_TIMESTAMP` |

Also includes FTS5 virtual index (`entries_fts`) on `title` + `content` for `/api/search`.

## Response Shape

Every entry is returned as:

```json
{
  "id": 1,
  "title": "Sample",
  "content": "My note",
  "tags": ["idea", "telegram"],
  "created_at": "2026-03-09 11:35:00",
  "updated_at": "2026-03-09 11:35:00"
}
```

## Endpoints

### POST `/api/entries`
Create an entry.

Request body:
```json
{
  "title": "Optional title",
  "content": "Required text",
  "tags": ["optional", "array"]
}
```

Responses:
- `201` created entry object
- `400` if `content` missing

---

### GET `/api/entries`
List all entries ordered by newest first (`created_at DESC, id DESC`).

Response:
- `200` array of entry objects

---

### GET `/api/search?q=<query>`
Full-text search over title + content.

Response:
- `200` array of matching entries
- `400` if `q` missing

---

### DELETE `/api/entries/:id`
Delete one entry (cleanup endpoint).

Response:
- `204` deleted
- `404` not found
- `400` invalid id

---

### POST `/api/telegram/message`
OpenClaw gateway webhook target for incoming Telegram text (no polling bot).

Accepted payload examples:
```json
{ "text": "/mybrain my note #idea" }
```
or
```json
{ "message": { "text": "/mybrain my note #idea" } }
```

Behavior:
- Parses `/mybrain <message>`
- Extracts hashtag tags
- Saves entry to SQLite
- Returns reply payload for caller to send back to Telegram
