import express from 'express';
import { initDb, createEntry, listEntries, searchEntries, deleteEntry } from './db.js';
import { handleTelegramMyBrain } from '../telegram/handler.js';

const app = express();
const PORT = Number(process.env.PORT || 8081);

app.use(express.json());

initDb();

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'mybrain-api' });
});

app.post('/api/entries', (req, res) => {
  try {
    const { title = '', content, tags = [] } = req.body || {};
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'content is required (string)' });
    }

    const entry = createEntry({ title, content, tags });
    return res.status(201).json(entry);
  } catch (error) {
    return res.status(500).json({ error: 'failed_to_create_entry', detail: error.message });
  }
});

app.get('/api/entries', (_req, res) => {
  try {
    return res.json(listEntries());
  } catch (error) {
    return res.status(500).json({ error: 'failed_to_list_entries', detail: error.message });
  }
});

app.get('/api/search', (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'q is required' });
    return res.json(searchEntries(q));
  } catch (error) {
    return res.status(500).json({ error: 'failed_to_search_entries', detail: error.message });
  }
});

app.delete('/api/entries/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'invalid id' });
    const deleted = deleteEntry(id);
    if (!deleted) return res.status(404).json({ error: 'entry_not_found' });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'failed_to_delete_entry', detail: error.message });
  }
});

/**
 * OpenClaw Gateway integration endpoint (no polling):
 * Configure Telegram routing to POST incoming updates here.
 * Expected body examples:
 * { text: '/mybrain ...' }
 * { message: { text: '/mybrain ...' } }
 */
app.post('/api/telegram/message', (req, res) => {
  try {
    const text = req.body?.text || req.body?.message?.text || '';
    const result = handleTelegramMyBrain(text);

    if (!result.handled) {
      return res.status(200).json({ handled: false });
    }

    if (!result.ok) {
      return res.status(400).json({ handled: true, error: result.message });
    }

    return res.status(200).json({ handled: true, reply: result.message, entry: result.entry });
  } catch (error) {
    return res.status(500).json({ error: 'failed_to_process_telegram_message', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`MyBrain API listening on port ${PORT}`);
});
