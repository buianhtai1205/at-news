export type ArticleStatus = "DRAFT" | "APPLIED" | "APPROVED" | "REJECTED" | "DELETED";

export interface BilingualSentence {
  en: string;
  vi: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  authorId: string;
  categoryId: string;
  status: ArticleStatus;
  coverImageUrl?: string;
  content: BilingualSentence[];
  rejectionReason?: string | null;
  isPremium: boolean;
  premiumStartIndex: number;
  createdAt: string;
  updatedAt: string;
}
