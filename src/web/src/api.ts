import type { Entry, CreateEntryPayload } from "./types";

// Set to true to use real backend API, false for localStorage mock
const USE_REAL_API = false;

const STORAGE_KEY = "mybrain_entries";

function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Entry[]) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: Entry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// --- Mock API ---

const mockApi = {
  async createEntry(payload: CreateEntryPayload): Promise<Entry> {
    const entries = loadEntries();
    const now = new Date().toISOString();
    const entry: Entry = {
      id: crypto.randomUUID(),
      title: payload.title,
      content: payload.content,
      tags: payload.tags,
      created_at: now,
      updated_at: now,
    };
    entries.unshift(entry);
    saveEntries(entries);
    return entry;
  },

  async getEntries(): Promise<Entry[]> {
    return loadEntries();
  },

  async searchEntries(query: string): Promise<Entry[]> {
    const q = query.toLowerCase();
    return loadEntries().filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)),
    );
  },
};

// --- Real API ---

const realApi = {
  async createEntry(payload: CreateEntryPayload): Promise<Entry> {
    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return (await res.json()) as Entry;
  },

  async getEntries(): Promise<Entry[]> {
    const res = await fetch("/api/entries");
    return (await res.json()) as Entry[];
  },

  async searchEntries(query: string): Promise<Entry[]> {
    const res = await fetch(
      `/api/search?q=${encodeURIComponent(query)}`,
    );
    return (await res.json()) as Entry[];
  },
};

const api = USE_REAL_API ? realApi : mockApi;

export const { createEntry, getEntries, searchEntries } = api;
