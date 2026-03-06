import { User } from "@/src/core/entities/User";
import { IUserRepository } from "@/src/core/repositories/IUserRepository";
import { supabase } from "@/lib/supabase";

const TABLE = "users";

// ─── Mappers: snake_case (DB) ↔ camelCase (Entity) ──────────

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at: string;
}

function toEntity(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role as User["role"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(user: Partial<User>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (user.id !== undefined) row.id = user.id;
  if (user.name !== undefined) row.name = user.name;
  if (user.email !== undefined) row.email = user.email;
  if (user.passwordHash !== undefined) row.password_hash = user.passwordHash;
  if (user.role !== undefined) row.role = user.role;
  if (user.createdAt !== undefined) row.created_at = user.createdAt;
  if (user.updatedAt !== undefined) row.updated_at = user.updatedAt;
  return row;
}

// ─── Repository ──────────────────────────────────────────────

export class SupabaseUserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) throw new Error(`DB error: ${error.message}`);
    return (data as UserRow[]).map(toEntity);
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`DB error: ${error.message}`);
    return data ? toEntity(data as UserRow) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase.from(TABLE).select("*").eq("email", email).maybeSingle();
    if (error) throw new Error(`DB error: ${error.message}`);
    return data ? toEntity(data as UserRow) : null;
  }

  async create(user: User): Promise<User> {
    const { data, error } = await supabase.from(TABLE).insert(toRow(user)).select().single();
    if (error) throw new Error(`DB error: ${error.message}`);
    return toEntity(data as UserRow);
  }

  async update(id: string, partial: Partial<User>): Promise<User | null> {
    const row = toRow(partial);
    const { data, error } = await supabase.from(TABLE).update(row).eq("id", id).select().single();
    if (error) throw new Error(`DB error: ${error.message}`);
    return data ? toEntity(data as UserRow) : null;
  }

  async delete(id: string): Promise<boolean> {
    const { error, count } = await supabase.from(TABLE).delete({ count: "exact" }).eq("id", id);
    if (error) throw new Error(`DB error: ${error.message}`);
    return (count ?? 0) > 0;
  }
}
