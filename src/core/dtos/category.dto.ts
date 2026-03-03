import { z } from "zod";

export const CreateCategoryDTO = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional(),
});

export const UpdateCategoryDTO = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategoryDTO>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryDTO>;
