import { useState } from "react";
import type { Entry } from "./types";

interface EntryListProps {
  entries: Entry[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function snippet(text: string, maxLen = 120): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

export default function EntryList({ entries }: EntryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-400">No entries yet.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry) => {
        const isExpanded = expandedId === entry.id;
        return (
          <li
            key={entry.id}
            onClick={() => setExpandedId(isExpanded ? null : entry.id)}
            className="cursor-pointer rounded border border-gray-200 p-3 hover:border-gray-300"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-gray-900">
                {entry.title}
              </h3>
              <span className="shrink-0 text-xs text-gray-400">
                {formatDate(entry.created_at)}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
              {isExpanded ? entry.content : snippet(entry.content)}
            </p>

            {entry.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {isExpanded && entry.updated_at !== entry.created_at && (
              <p className="mt-2 text-xs text-gray-400">
                Updated {formatDate(entry.updated_at)}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
