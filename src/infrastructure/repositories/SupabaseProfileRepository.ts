import { Profile } from "@/src/core/entities/Profile";
import { IProfileRepository } from "@/src/core/repositories/IProfileRepository";
import { supabase } from "@/lib/supabase";

const TABLE = "profiles";

interface ProfileRow {
  user_id: string;
  is_subscribed: boolean;
  balance: number;
  subscribed_at: string | null;
  created_at: string;
  updated_at: string;
}

function toEntity(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    isSubscribed: row.is_subscribed,
    balance: Number(row.balance),
    subscribedAt: row.subscribed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseProfileRepository implements IProfileRepository {
  async findByUserId(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(`DB error: ${error.message}`);
    return data ? toEntity(data as ProfileRow) : null;
  }

  async upsert(profile: Profile): Promise<Profile> {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert({
        user_id: profile.userId,
        is_subscribed: profile.isSubscribed,
        balance: profile.balance,
        subscribed_at: profile.subscribedAt,
      }, { onConflict: "user_id" })
      .select()
      .single();
    if (error) throw new Error(`DB error: ${error.message}`);
    return toEntity(data as ProfileRow);
  }

  async updateSubscription(userId: string, isSubscribed: boolean): Promise<Profile | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        is_subscribed: isSubscribed,
        subscribed_at: isSubscribed ? new Date().toISOString() : null,
      })
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw new Error(`DB error: ${error.message}`);
    return data ? toEntity(data as ProfileRow) : null;
  }

  async getBalance(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("balance")
      .eq("user_id", userId)
      .single();
    if (error) throw new Error(`DB error: ${error.message}`);
    return Number((data as { balance: number }).balance);
  }

  async recordPremiumView(articleId: string, viewerId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc("record_premium_view", {
      p_article_id: articleId,
      p_viewer_id: viewerId,
    });
    if (error) throw new Error(`RPC error: ${error.message}`);
    return data as boolean;
  }
}
