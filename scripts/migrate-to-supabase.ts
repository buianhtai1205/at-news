/**
 * AT-News: Migrate local JSON data → Supabase
 *
 * Usage:
 *   npx tsx scripts/migrate-to-supabase.ts
 *
 * Requires: SUPABASE_URL and SUPABASE_ANON_KEY in .env
 * Tables must be created first (run scripts/setup-supabase.sql in Supabase Dashboard).
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// ─── Supabase client ────────────────────────────────────────
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(url, key);

// ─── Paths ──────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, "../src/infrastructure/database/data");

function loadJSON<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T[];
}

// ─── Types matching the JSON files ──────────────────────────
interface UserJSON {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryJSON {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ArticleJSON {
  id: string;
  slug: string;
  title: string;
  authorId: string;
  categoryId: string;
  status: string;
  coverImageUrl?: string;
  content: { en: string; vi: string }[];
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Migration helpers ──────────────────────────────────────

async function migrateUsers() {
  const users = loadJSON<UserJSON>("users.json");
  console.log(`\n📦 Migrating ${users.length} users...`);

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    password_hash: u.passwordHash,
    role: u.role,
    created_at: u.createdAt,
    updated_at: u.updatedAt,
  }));

  const { data, error } = await supabase
    .from("users")
    .upsert(rows, { onConflict: "id" })
    .select();

  if (error) {
    console.error("  ❌ Users migration failed:", error.message);
    return false;
  }

  console.log(`  ✅ ${data.length} users migrated successfully.`);
  return true;
}

async function migrateCategories() {
  const categories = loadJSON<CategoryJSON>("categories.json");
  console.log(`\n📦 Migrating ${categories.length} categories...`);

  const rows = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  }));

  const { data, error } = await supabase
    .from("categories")
    .upsert(rows, { onConflict: "id" })
    .select();

  if (error) {
    console.error("  ❌ Categories migration failed:", error.message);
    return false;
  }

  console.log(`  ✅ ${data.length} categories migrated successfully.`);
  return true;
}

async function migrateArticles() {
  const articles = loadJSON<ArticleJSON>("articles.json");
  console.log(`\n📦 Migrating ${articles.length} articles...`);

  const rows = articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    author_id: a.authorId,
    category_id: a.categoryId,
    status: a.status,
    cover_image_url: a.coverImageUrl ?? null,
    content: a.content, // JSONB — Supabase accepts JS objects directly
    rejection_reason: a.rejectionReason ?? null,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  }));

  // Insert in batches of 50 to avoid payload limits
  const BATCH_SIZE = 50;
  let total = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from("articles")
      .upsert(batch, { onConflict: "id" })
      .select();

    if (error) {
      console.error(`  ❌ Articles batch ${i / BATCH_SIZE + 1} failed:`, error.message);
      return false;
    }

    total += data.length;
    console.log(`  📄 Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${data.length} articles inserted`);
  }

  console.log(`  ✅ ${total} articles migrated successfully.`);
  return true;
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  console.log("🚀 AT-News: Starting migration from JSON → Supabase");
  console.log(`   Supabase URL: ${url}`);
  console.log("─".repeat(60));

  // Order matters: users → categories → articles (foreign key constraints)
  const usersOk = await migrateUsers();
  if (!usersOk) {
    console.error("\n⛔ Aborting: users migration failed.");
    process.exit(1);
  }

  const categoriesOk = await migrateCategories();
  if (!categoriesOk) {
    console.error("\n⛔ Aborting: categories migration failed.");
    process.exit(1);
  }

  const articlesOk = await migrateArticles();
  if (!articlesOk) {
    console.error("\n⛔ Aborting: articles migration failed.");
    process.exit(1);
  }

  console.log("\n─".repeat(60));
  console.log("🎉 Migration complete! All data has been moved to Supabase.");
}

main().catch((err) => {
  console.error("💥 Unexpected error:", err);
  process.exit(1);
});
