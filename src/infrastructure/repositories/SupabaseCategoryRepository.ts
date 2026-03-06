import { Category } from "@/src/core/entities/Category";
import { ICategoryRepository } from "@/src/core/repositories/ICategoryRepository";
import { supabase } from "@/lib/supabase";

const TABLE = "categories";

// ─── Mappers: snake_case (DB) ↔ camelCase (Entity) ──────────

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

function toEntity(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(cat: Partial<Category>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (cat.id !== undefined) row.id = cat.id;
  if (cat.name !== undefined) row.name = cat.name;
  if (cat.slug !== undefined) row.slug = cat.slug;
  if (cat.description !== undefined) row.description = cat.description;
  if (cat.createdAt !== undefined) row.created_at = cat.createdAt;
  if (cat.updatedAt !== undefined) row.updated_at = cat.updatedAt;
  return row;
}

// ─── Repository ──────────────────────────────────────────────

export class SupabaseCategoryRepository implements ICategoryRepository {
  async findAll(): Promise<Category[]> {
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) throw new Error(`DB error: ${error.message}`);
    return (data as CategoryRow[]).map(toEntity);
  }

  async findById(id: string): Promise<Category | null> {
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`DB error: ${error.message}`);
    return data ? toEntity(data as CategoryRow) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase.from(TABLE).select("*").eq("slug", slug).maybeSingle();
    if (error) throw new Error(`DB error: ${error.message}`);
    return data ? toEntity(data as CategoryRow) : null;
  }

  async create(category: Category): Promise<Category> {
    const { data, error } = await supabase.from(TABLE).insert(toRow(category)).select().single();
    if (error) throw new Error(`DB error: ${error.message}`);
    return toEntity(data as CategoryRow);
  }

  async update(id: string, partial: Partial<Category>): Promise<Category | null> {
    const row = toRow(partial);
    const { data, error } = await supabase.from(TABLE).update(row).eq("id", id).select().single();
    if (error) throw new Error(`DB error: ${error.message}`);
    return data ? toEntity(data as CategoryRow) : null;
  }

  async delete(id: string): Promise<boolean> {
    const { error, count } = await supabase.from(TABLE).delete({ count: "exact" }).eq("id", id);
    if (error) throw new Error(`DB error: ${error.message}`);
    return (count ?? 0) > 0;
  }
}
