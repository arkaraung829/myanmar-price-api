-- Currency rates historical database schema

CREATE TABLE IF NOT EXISTS currency_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  buy_rate REAL,
  sell_rate REAL,
  source TEXT DEFAULT 'SDB',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, currency_code)
);

-- Index for faster queries by currency and date range
CREATE INDEX IF NOT EXISTS idx_currency_date ON currency_rates(currency_code, date DESC);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_date ON currency_rates(date DESC);

-- Ads table for managing banner advertisements
CREATE TABLE IF NOT EXISTS ads (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  app_store_url TEXT,
  play_store_url TEXT,
  is_active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index for active ads
CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(is_active, display_order);
