import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.MYBRAIN_DB_PATH || path.resolve(process.cwd(), 'data', 'mybrain.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY,
      title TEXT,
      content TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS entries_fts USING fts5(
      title,
      content,
      content='entries',
      content_rowid='id'
    );

    CREATE TRIGGER IF NOT EXISTS entries_ai AFTER INSERT ON entries BEGIN
      INSERT INTO entries_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
    END;

    CREATE TRIGGER IF NOT EXISTS entries_ad AFTER DELETE ON entries BEGIN
      INSERT INTO entries_fts(entries_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
    END;

    CREATE TRIGGER IF NOT EXISTS entries_au AFTER UPDATE ON entries BEGIN
      INSERT INTO entries_fts(entries_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
      INSERT INTO entries_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
    END;
  `);
}

function normalizeTags(tags) {
  if (!tags) return '[]';
  if (Array.isArray(tags)) return JSON.stringify(tags);
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return JSON.stringify(parsed);
    } catch {
      return JSON.stringify(tags.split(',').map((t) => t.trim()).filter(Boolean));
    }
  }
  return '[]';
}

function rowToEntry(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    tags: JSON.parse(row.tags || '[]'),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function createEntry({ title = '', content, tags = [] }) {
  const stmt = db.prepare(`
    INSERT INTO entries (title, content, tags, created_at, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);
  const result = stmt.run(title, content, normalizeTags(tags));
  return getEntryById(result.lastInsertRowid);
}

export function getEntryById(id) {
  const row = db.prepare('SELECT * FROM entries WHERE id = ?').get(id);
  return row ? rowToEntry(row) : null;
}

export function listEntries() {
  const rows = db.prepare('SELECT * FROM entries ORDER BY datetime(created_at) DESC, id DESC').all();
  return rows.map(rowToEntry);
}

export function searchEntries(query) {
  const q = (query || '').trim();
  if (!q) return [];

  const rows = db
    .prepare(`
      SELECT e.*
      FROM entries_fts f
      JOIN entries e ON e.id = f.rowid
      WHERE entries_fts MATCH ?
      ORDER BY rank
      LIMIT 50
    `)
    .all(q);

  return rows.map(rowToEntry);
}

export function deleteEntry(id) {
  const stmt = db.prepare('DELETE FROM entries WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}
