import { v4 as uuidv4 } from "uuid";
import { ICategoryRepository } from "@/src/core/repositories/ICategoryRepository";
import { IArticleRepository } from "@/src/core/repositories/IArticleRepository";
import { CreateCategoryInput, UpdateCategoryInput } from "@/src/core/dtos/category.dto";
import { Category } from "@/src/core/entities/Category";
import {
  CATEGORY_ALREADY_EXISTS,
  CATEGORY_HAS_ARTICLES,
  CATEGORY_NOT_FOUND,
} from "@/src/core/errors/errorCodes";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export class CategoryService {
  constructor(
    private categoryRepo: ICategoryRepository,
    private articleRepo: IArticleRepository
  ) {}

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepo.findAll();
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw CATEGORY_NOT_FOUND();
    return category;
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const slug = slugify(input.name);
    const existing = await this.categoryRepo.findBySlug(slug);
    if (existing) throw CATEGORY_ALREADY_EXISTS();

    const now = new Date().toISOString();
    const category: Category = {
      id: `cat_${uuidv4().slice(0, 8)}`,
      name: input.name,
      slug,
      description: input.description,
      createdAt: now,
      updatedAt: now,
    };

    return this.categoryRepo.create(category);
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw CATEGORY_NOT_FOUND();

    const updates: Partial<Category> = { updatedAt: new Date().toISOString() };

    if (input.name) {
      const slug = slugify(input.name);
      const existing = await this.categoryRepo.findBySlug(slug);
      if (existing && existing.id !== id) throw CATEGORY_ALREADY_EXISTS();
      updates.name = input.name;
      updates.slug = slug;
    }

    if (input.description !== undefined) {
      updates.description = input.description;
    }

    const updated = await this.categoryRepo.update(id, updates);
    return updated!;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw CATEGORY_NOT_FOUND();

    const articles = await this.articleRepo.findByCategory(id);
    if (articles.length > 0) throw CATEGORY_HAS_ARTICLES();

    return this.categoryRepo.delete(id);
  }
}
