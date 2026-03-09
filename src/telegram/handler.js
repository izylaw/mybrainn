/**
 * MyBrain Telegram Message Handler
 * 
 * Called by OpenClaw when a message arrives from @my_brain_ayg_bot
 * Automatically saves /mybrain commands to the database
 */

import Database from 'better-sqlite3';

/**
 * Handle incoming Telegram message
 * @param {string} text - The message text
 * @returns {object} - { handled, ok, message, entry }
 */
export function handleTelegramMyBrain(text) {
  if (!text || !text.startsWith('/mybrain')) {
    return { handled: false };
  }

  // Extract content (remove '/mybrain ' prefix, trim)
  const content = text.slice('/mybrain'.length).trim();

  if (!content) {
    return {
      handled: true,
      ok: false,
      message: '❌ Usage: /mybrain <your message>',
    };
  }

  // Synchronously save to database
  try {
    const db = new Database(process.env.DB_PATH || './data/mybrain.db');

    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO entries (title, content, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      `Telegram (${new Date(now).toLocaleTimeString()})`,
      content,
      JSON.stringify(['telegram']),
      now,
      now
    );

    db.close();

    return {
      handled: true,
      ok: true,
      message: `✅ Saved: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`,
      entry: {
        id: result.lastInsertRowid,
        content: content,
        created_at: now,
      },
    };
  } catch (error) {
    return {
      handled: true,
      ok: false,
      message: `❌ Error: ${error.message}`,
    };
  }
}
