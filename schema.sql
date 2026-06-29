CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  plan INTEGER NOT NULL DEFAULT 3,
  fasting_start_date TEXT NOT NULL,
  memo TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS message_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  template_key TEXT NOT NULL,
  checked_at TEXT DEFAULT (datetime('now', 'localtime')),
  UNIQUE(client_id, template_key),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
