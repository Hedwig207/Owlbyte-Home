-- OwlByte D1 数据库结构
-- 使用方法：
--   1. Cloudflare Dashboard → Storage & Databases → D1 → Create database
--   2. 数据库名填 owlbyte-db，创建后复制 database_id
--   3. 将 database_id 填入 wrangler.toml 的 d1_databases 绑定
--   4. 在 Dashboard 的 D1 Console 中执行本文件全部 SQL（或 wrangler d1 execute owlbyte-db --file=./schema.sql --remote）
-- 执行后 Functions 自动切换到持久化模式（isMockMode 检测到 DATABASE 绑定即生效）

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  role TEXT DEFAULT 'user',
  email_verified INTEGER DEFAULT 0,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS email_verifications (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  source TEXT,
  unsub_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS visitors (
  session_id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT,
  last_ping_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  stack TEXT,
  url TEXT,
  timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS log_views (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  ua TEXT,
  timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bug_reports (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  occur_time TEXT NOT NULL,
  summary TEXT NOT NULL,
  reproduce TEXT NOT NULL,
  contact TEXT,
  status TEXT DEFAULT 'open',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_visitors_last_ping ON visitors(last_ping_at);
CREATE INDEX IF NOT EXISTS idx_log_views_timestamp ON log_views(timestamp);
