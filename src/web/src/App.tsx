import { useState, useEffect, useCallback } from "react";
import EntryForm from "./EntryForm";
import EntryList from "./EntryList";
import SearchBar from "./SearchBar";
import { createEntry, getEntries, searchEntries } from "./api";
import type { Entry, CreateEntryPayload } from "./types";

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadEntries = useCallback(async () => {
    const data = searchQuery
      ? await searchEntries(searchQuery)
      : await getEntries();
    setEntries(data);
  }, [searchQuery]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  async function handleCreate(payload: CreateEntryPayload) {
    await createEntry(payload);
    setSearchQuery("");
    const data = await getEntries();
    setEntries(data);
  }

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">MyBrain</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-gray-500 uppercase tracking-wide">
          New Entry
        </h2>
        <EntryForm onSubmit={handleCreate} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Entries
          </h2>
        </div>
        <div className="mb-4">
          <SearchBar onSearch={handleSearch} />
        </div>
        <EntryList entries={entries} />
      </section>
    </div>
  );
}
