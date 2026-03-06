export interface Profile {
  userId: string;
  isSubscribed: boolean;
  balance: number;
  subscribedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
