import { Profile } from "../entities/Profile";

export interface IProfileRepository {
  findByUserId(userId: string): Promise<Profile | null>;
  upsert(profile: Profile): Promise<Profile>;
  updateSubscription(userId: string, isSubscribed: boolean): Promise<Profile | null>;
  getBalance(userId: string): Promise<number>;
  recordPremiumView(articleId: string, viewerId: string): Promise<boolean>;
}
