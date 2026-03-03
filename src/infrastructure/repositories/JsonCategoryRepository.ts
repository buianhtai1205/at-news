import { Category } from "@/src/core/entities/Category";
import { ICategoryRepository } from "@/src/core/repositories/ICategoryRepository";
import { JsonStore } from "../database/JsonStore";

export class JsonCategoryRepository implements ICategoryRepository {
  private store = new JsonStore<Category>("categories.json");

  async findAll(): Promise<Category[]> {
    return this.store.findAll();
  }

  async findById(id: string): Promise<Category | null> {
    return this.store.findById(id);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.store.findOneBy((c) => c.slug === slug);
  }

  async create(category: Category): Promise<Category> {
    return this.store.create(category);
  }

  async update(id: string, data: Partial<Category>): Promise<Category | null> {
    return this.store.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
