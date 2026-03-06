import { z } from "zod";

const BilingualSentenceSchema = z.object({
  en: z.string().min(1, "English text is required"),
  vi: z.string().min(1, "Vietnamese text is required"),
});

export const CreateArticleDTO = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  categoryId: z.string().min(1, "Category is required"),
  coverImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  content: z.array(BilingualSentenceSchema).min(1, "At least one bilingual sentence is required"),
  status: z.enum(["DRAFT", "APPLIED"]).optional().default("DRAFT"),
  isPremium: z.boolean().optional().default(false),
  premiumStartIndex: z.number().int().min(1).optional().default(3),
});

export const UpdateArticleDTO = z.object({
  title: z.string().min(3).optional(),
  categoryId: z.string().min(1).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  content: z.array(BilingualSentenceSchema).min(1).optional(),
  status: z.enum(["DRAFT", "APPLIED"]).optional(),
  isPremium: z.boolean().optional(),
  premiumStartIndex: z.number().int().min(1).optional(),
});

export const RejectArticleDTO = z.object({
  reason: z.string().min(3, "Rejection reason must be at least 3 characters"),
});

export type CreateArticleInput = z.infer<typeof CreateArticleDTO>;
export type UpdateArticleInput = z.infer<typeof UpdateArticleDTO>;
export type RejectArticleInput = z.infer<typeof RejectArticleDTO>;
