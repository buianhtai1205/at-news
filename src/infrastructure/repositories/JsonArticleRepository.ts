import { Article, ArticleStatus } from "@/src/core/entities/Article";
import { IArticleRepository } from "@/src/core/repositories/IArticleRepository";
import { JsonStore } from "../database/JsonStore";

export class JsonArticleRepository implements IArticleRepository {
  private store = new JsonStore<Article>("articles.json");

  async findAll(): Promise<Article[]> {
    return this.store.findAll();
  }

  async findById(id: string): Promise<Article | null> {
    return this.store.findById(id);
  }

  async findBySlug(slug: string): Promise<Article | null> {
    return this.store.findOneBy((a) => a.slug === slug);
  }

  async findByStatus(status: ArticleStatus): Promise<Article[]> {
    return this.store.findBy((a) => a.status === status);
  }

  async findByAuthor(authorId: string): Promise<Article[]> {
    return this.store.findBy((a) => a.authorId === authorId);
  }

  async findByCategory(categoryId: string): Promise<Article[]> {
    return this.store.findBy((a) => a.categoryId === categoryId);
  }

  async create(article: Article): Promise<Article> {
    return this.store.create(article);
  }

  async update(id: string, data: Partial<Article>): Promise<Article | null> {
    return this.store.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
