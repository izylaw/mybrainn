import { createEntry } from '../api/db.js';

function parseTags(text) {
  return [...text.matchAll(/#([\p{L}0-9_-]+)/gu)].map((m) => m[1]);
}

export function parseMyBrainCommand(text = '') {
  const trimmed = text.trim();
  if (!trimmed.startsWith('/mybrain')) return null;

  const body = trimmed.replace(/^\/mybrain\s*/i, '').trim();
  if (!body) return { error: 'Usage: /mybrain <message>' };

  const tags = parseTags(body);
  const plain = body.replace(/#([\p{L}0-9_-]+)/gu, '').trim();

  const title = plain.length > 60 ? `${plain.slice(0, 57)}...` : plain;

  return {
    title: title || 'Quick note',
    content: plain || body,
    tags,
  };
}

export function handleTelegramMyBrain(text) {
  const parsed = parseMyBrainCommand(text);
  if (!parsed) return { handled: false };
  if (parsed.error) return { handled: true, ok: false, message: parsed.error };

  const entry = createEntry(parsed);
  return {
    handled: true,
    ok: true,
    entry,
    message: `Saved to MyBrain (#${entry.id}) ✅`,
  };
}
