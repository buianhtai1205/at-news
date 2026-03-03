import { Article, ArticleStatus } from "../entities/Article";

export interface IArticleRepository {
  findAll(): Promise<Article[]>;
  findById(id: string): Promise<Article | null>;
  findBySlug(slug: string): Promise<Article | null>;
  findByStatus(status: ArticleStatus): Promise<Article[]>;
  findByAuthor(authorId: string): Promise<Article[]>;
  findByCategory(categoryId: string): Promise<Article[]>;
  create(article: Article): Promise<Article>;
  update(id: string, data: Partial<Article>): Promise<Article | null>;
  delete(id: string): Promise<boolean>;
}
