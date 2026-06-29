export interface Client {
  id: number;
  name: string;
  plan: number;
  fasting_start_date: string;
  memo: string;
  created_at: string;
}

export interface MessageCheck {
  id: number;
  client_id: number;
  template_key: string;
  checked_at: string;
}

export function getDB(): D1Database {
  return (globalThis as unknown as { DB: D1Database }).DB;
}
