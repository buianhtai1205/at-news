import { Article, ArticleStatus } from "@/src/core/entities/Article";
import { IArticleRepository } from "@/src/core/repositories/IArticleRepository";
import { supabase } from "@/lib/supabase";

const TABLE = "articles";

// ─── Mappers: snake_case (DB) ↔ camelCase (Entity) ──────────

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  author_id: string;
  category_id: string;
  status: string;
  cover_image_url: string | null;
  content: unknown; // JSONB — comes back as parsed JSON
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

function toEntity(row: ArticleRow): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    authorId: row.author_id,
    categoryId: row.category_id,
    status: row.status as ArticleStatus,
    coverImageUrl: row.cover_image_url ?? undefined,
    content: row.content as Article["content"],
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(article: Partial<Article>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (article.id !== undefined) row.id = article.id;
  if (article.slug !== undefined) row.slug = article.slug;
  if (article.title !== undefined) row.title = article.title;
  if (article.authorId !== undefined) row.author_id = article.authorId;
  if (article.categoryId !== undefined) row.category_id = article.categoryId;
  if (article.status !== undefined) row.status = article.status;
  if (article.coverImageUrl !== undefined) row.cover_image_url = article.coverImageUrl || null;
  if (article.content !== undefined) row.content = article.content; // JSONB accepts JS objects/arrays directly
  if (article.rejectionReason !== undefined) row.rejection_reason = article.rejectionReason;
  if (article.createdAt !== undefined) row.created_at = article.createdAt;
  if (article.updatedAt !== undefined) row.updated_at = article.updatedAt;
  return row;
}

// ─── Repository ──────────────────────────────────────────────

export class SupabaseArticleRepository implements IArticleRepository {
  async findAll(): Promise<Article[]> {
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) throw new Error(`DB error: ${error.message}`);
    return (data as ArticleRow[]).map(toEntity);
  }

  async findById(id: string): Promise<Article | null> {
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`DB error: ${error.message}`);
    return data ? toEntity(data as ArticleRow) : null;
  }

  async findBySlug(slug: string): Promise<Article | null> {
    const { data, error } = await supabase.from(TABLE).select("*").eq("slug", slug).maybeSingle();
    if (error) throw new Error(`DB error: ${error.message}`);
    return data ? toEntity(data as ArticleRow) : null;
  }

  async findByStatus(status: ArticleStatus): Promise<Article[]> {
    const { data, error } = await supabase.from(TABLE).select("*").eq("status", status);
    if (error) throw new Error(`DB error: ${error.message}`);
    return (data as ArticleRow[]).map(toEntity);
  }

  async findByAuthor(authorId: string): Promise<Article[]> {
    const { data, error } = await supabase.from(TABLE).select("*").eq("author_id", authorId);
    if (error) throw new Error(`DB error: ${error.message}`);
    return (data as ArticleRow[]).map(toEntity);
  }

  async findByCategory(categoryId: string): Promise<Article[]> {
    const { data, error } = await supabase.from(TABLE).select("*").eq("category_id", categoryId);
    if (error) throw new Error(`DB error: ${error.message}`);
    return (data as ArticleRow[]).map(toEntity);
  }

  async create(article: Article): Promise<Article> {
    const { data, error } = await supabase.from(TABLE).insert(toRow(article)).select().single();
    if (error) throw new Error(`DB error: ${error.message}`);
    return toEntity(data as ArticleRow);
  }

  async update(id: string, partial: Partial<Article>): Promise<Article | null> {
    const row = toRow(partial);
    const { data, error } = await supabase.from(TABLE).update(row).eq("id", id).select().single();
    if (error) throw new Error(`DB error: ${error.message}`);
    return data ? toEntity(data as ArticleRow) : null;
  }

  async delete(id: string): Promise<boolean> {
    const { error, count } = await supabase.from(TABLE).delete({ count: "exact" }).eq("id", id);
    if (error) throw new Error(`DB error: ${error.message}`);
    return (count ?? 0) > 0;
  }
}
