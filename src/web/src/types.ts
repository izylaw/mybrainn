export interface Entry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateEntryPayload {
  title: string;
  content: string;
  tags: string[];
}
