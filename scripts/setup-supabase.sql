-- ============================================================
-- AT-News: Supabase Database Setup
-- ============================================================

-- 1. Create ENUM type for article status
CREATE TYPE article_status AS ENUM ('DRAFT', 'APPLIED', 'APPROVED', 'REJECTED', 'DELETED');

-- 2. Create ENUM type for user role
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');

-- ─── Users Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'USER',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast email lookup (login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ─── Categories Table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);

-- ─── Articles Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id                TEXT PRIMARY KEY,
  slug              TEXT UNIQUE NOT NULL,
  title             TEXT NOT NULL,
  author_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id       TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  status            article_status NOT NULL DEFAULT 'DRAFT',
  cover_image_url   TEXT,
  content           JSONB NOT NULL DEFAULT '[]'::jsonb,
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_articles_slug      ON articles (slug);
CREATE INDEX IF NOT EXISTS idx_articles_status    ON articles (status);
CREATE INDEX IF NOT EXISTS idx_articles_author    ON articles (author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category  ON articles (category_id);
CREATE INDEX IF NOT EXISTS idx_articles_created   ON articles (created_at DESC);

-- ─── Row Level Security (RLS) ────────────────────────────────
-- Enable RLS on all tables (policies use service role via anon key + server-side only)
ALTER TABLE users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles   ENABLE ROW LEVEL SECURITY;

-- Allow full access for the service/anon key (server-side API routes)
CREATE POLICY "Allow all for service" ON users      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON articles   FOR ALL USING (true) WITH CHECK (true);

-- ─── Auto-update updated_at trigger ─────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
