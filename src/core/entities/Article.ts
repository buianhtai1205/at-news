export type ArticleStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";

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
  rejectReason?: string | null;
  createdAt: string;
  updatedAt: string;
}
