-- ============================================================
-- AT-News: Marketplace Upgrade — SQL Migration
-- Run this in Supabase SQL Editor AFTER setup-supabase.sql
-- ============================================================

-- ─── 1. Profiles table (subscription + balance) ─────────────
CREATE TABLE IF NOT EXISTS profiles (
  user_id       TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  is_subscribed BOOLEAN NOT NULL DEFAULT false,
  balance       NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  subscribed_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- Auto-create profile on user insert
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_profile
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- Back-fill profiles for existing users
INSERT INTO profiles (user_id)
SELECT id FROM users
ON CONFLICT DO NOTHING;

-- ─── 2. Add premium columns to articles ─────────────────────
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS premium_start_index INTEGER NOT NULL DEFAULT 3;

-- ─── 3. Article views tracking table ─────────────────────────
CREATE TABLE IF NOT EXISTS article_views (
  id          BIGSERIAL PRIMARY KEY,
  article_id  TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  viewer_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(article_id, viewer_id)  -- one view per user per article
);

ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service" ON article_views FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_article_views_article ON article_views (article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_viewer  ON article_views (viewer_id);

-- ─── 4. Commission RPC function ─────────────────────────────
-- Records a subscriber view and credits the creator.
-- Commission rate: 0.05 USD per subscriber view (configurable).
CREATE OR REPLACE FUNCTION record_premium_view(
  p_article_id TEXT,
  p_viewer_id  TEXT,
  p_commission NUMERIC DEFAULT 0.05
)
RETURNS BOOLEAN AS $$
DECLARE
  v_author_id TEXT;
  v_inserted  BOOLEAN := false;
BEGIN
  -- Get article author
  SELECT author_id INTO v_author_id FROM articles WHERE id = p_article_id;
  IF v_author_id IS NULL THEN
    RETURN false;
  END IF;

  -- Don't credit if viewer is the author (viewing own article)
  IF v_author_id = p_viewer_id THEN
    RETURN false;
  END IF;

  -- Insert view (unique constraint prevents duplicates)
  BEGIN
    INSERT INTO article_views (article_id, viewer_id)
    VALUES (p_article_id, p_viewer_id);
    v_inserted := true;
  EXCEPTION WHEN unique_violation THEN
    -- Already viewed, no commission
    RETURN false;
  END;

  -- Credit the creator
  IF v_inserted THEN
    UPDATE profiles
    SET balance = balance + p_commission,
        updated_at = NOW()
    WHERE user_id = v_author_id;
  END IF;

  RETURN v_inserted;
END;
$$ LANGUAGE plpgsql;

-- ─── 5. Updated_at trigger for profiles ─────────────────────
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
