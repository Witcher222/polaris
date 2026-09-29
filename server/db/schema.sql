-- Core Tables
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT CHECK (type IN ('report','dataset','publication','photo','video','activity','story')),
  title TEXT NOT NULL,
  abstract TEXT,
  summary TEXT,
  source TEXT,
  source_id TEXT,
  url TEXT,
  file_path TEXT,
  thumbnail_url TEXT,
  licence TEXT,
  credit TEXT,
  authors JSON,
  published_at DATETIME,
  region TEXT,
  discipline TEXT,
  lat REAL,
  lon REAL,
  status TEXT CHECK (status IN ('harvested','draft','pending','approved','published','rejected')) DEFAULT 'harvested',
  quality_score INTEGER,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source, source_id)
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS item_tags (
  item_id INTEGER,
  tag_id INTEGER,
  PRIMARY KEY (item_id, tag_id),
  FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Full Text Search
CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(
  title, abstract, summary, authors, tags,
  content='items', content_rowid='id'
);

-- RAG / Embeddings
CREATE TABLE IF NOT EXISTS chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER,
  ord INTEGER,
  text TEXT,
  FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS embeddings (
  chunk_id INTEGER PRIMARY KEY,
  vector BLOB,
  FOREIGN KEY(chunk_id) REFERENCES chunks(id) ON DELETE CASCADE
);

-- Expeditions
CREATE TABLE IF NOT EXISTS expeditions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  region TEXT,
  status TEXT,
  start_date DATETIME,
  end_date DATETIME,
  vessel_or_station TEXT,
  summary TEXT,
  lat REAL,
  lon REAL
);

CREATE TABLE IF NOT EXISTS expedition_items (
  expedition_id INTEGER,
  item_id INTEGER,
  PRIMARY KEY (expedition_id, item_id),
  FOREIGN KEY(expedition_id) REFERENCES expeditions(id) ON DELETE CASCADE,
  FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Activities
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  date DATETIME,
  location TEXT,
  source_url TEXT
);

-- Outreach / Content Studio
CREATE TABLE IF NOT EXISTS content_drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER,
  channel TEXT,
  language TEXT,
  reading_level TEXT,
  body TEXT,
  hashtags TEXT,
  card_path TEXT,
  status TEXT CHECK (status IN ('draft','pending','approved','published','rejected')) DEFAULT 'draft',
  reason TEXT,
  created_by INTEGER,
  reviewed_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(item_id) REFERENCES items(id)
);

-- Automated Triggers
CREATE TABLE IF NOT EXISTS triggers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT,
  metric TEXT,
  value REAL,
  context JSON,
  proposed_draft_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Caching Live Data
CREATE TABLE IF NOT EXISTS live_cache (
  key TEXT PRIMARY KEY,
  payload JSON,
  fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- RBAC
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('admin','editor','researcher')) NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT,
  entity TEXT,
  entity_id INTEGER,
  at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System Health
CREATE TABLE IF NOT EXISTS ingest_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT,
  started_at DATETIME,
  finished_at DATETIME,
  fetched INTEGER,
  inserted INTEGER,
  updated INTEGER,
  error TEXT
);

-- Analytics
CREATE TABLE IF NOT EXISTS views (
  item_id INTEGER,
  at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
);
