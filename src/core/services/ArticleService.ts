import { v4 as uuidv4 } from "uuid";
import { IArticleRepository } from "@/src/core/repositories/IArticleRepository";
import { ICategoryRepository } from "@/src/core/repositories/ICategoryRepository";
import { IUserRepository } from "@/src/core/repositories/IUserRepository";
import { CreateArticleInput, UpdateArticleInput } from "@/src/core/dtos/article.dto";
import { Article } from "@/src/core/entities/Article";
import { JwtPayload } from "@/src/infrastructure/auth/jwt";
import {
  ARTICLE_NOT_FOUND,
  ARTICLE_NOT_APPLIED,
  CANNOT_EDIT_PUBLISHED,
  CATEGORY_NOT_FOUND,
  FORBIDDEN,
  REJECT_REASON_REQUIRED,
} from "@/src/core/errors/errorCodes";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export class ArticleService {
  constructor(
    private articleRepo: IArticleRepository,
    private categoryRepo: ICategoryRepository,
    private userRepo: IUserRepository
  ) {}

  async getPublishedArticles() {
    const articles = await this.articleRepo.findByStatus("APPROVED");
    return this.enrichArticles(articles);
  }

  async getAllArticles() {
    const articles = await this.articleRepo.findAll();
    return this.enrichArticles(articles);
  }

  async getArticlesByAuthor(authorId: string) {
    const articles = await this.articleRepo.findByAuthor(authorId);
    return this.enrichArticles(articles);
  }

  async getArticleBySlug(slug: string) {
    const article = await this.articleRepo.findBySlug(slug);
    if (!article) throw ARTICLE_NOT_FOUND();
    const enriched = await this.enrichArticles([article]);
    return enriched[0];
  }

  async getArticleById(id: string) {
    const article = await this.articleRepo.findById(id);
    if (!article) throw ARTICLE_NOT_FOUND();
    return article;
  }

  async createArticle(input: CreateArticleInput, user: JwtPayload): Promise<Article> {
    const category = await this.categoryRepo.findById(input.categoryId);
    if (!category) throw CATEGORY_NOT_FOUND();

    const now = new Date().toISOString();
    const baseSlug = slugify(input.title);
    const slug = `${baseSlug}-${uuidv4().slice(0, 6)}`;

    const article: Article = {
      id: `art_${uuidv4().slice(0, 8)}`,
      slug,
      title: input.title,
      authorId: user.sub,
      categoryId: input.categoryId,
      status: input.status ?? "DRAFT",
      coverImageUrl: input.coverImageUrl || undefined,
      content: input.content,
      rejectionReason: null,
      isPremium: input.isPremium ?? false,
      premiumStartIndex: input.premiumStartIndex ?? 3,
      createdAt: now,
      updatedAt: now,
    };

    return this.articleRepo.create(article);
  }

  async updateArticle(id: string, input: UpdateArticleInput, user: JwtPayload): Promise<Article> {
    const article = await this.articleRepo.findById(id);
    if (!article) throw ARTICLE_NOT_FOUND();

    // Only author can edit, unless admin
    if (article.authorId !== user.sub && user.role !== "ADMIN") throw FORBIDDEN();
    if (article.status === "APPROVED") throw CANNOT_EDIT_PUBLISHED();

    if (input.categoryId) {
      const category = await this.categoryRepo.findById(input.categoryId);
      if (!category) throw CATEGORY_NOT_FOUND();
    }

    const updated = await this.articleRepo.update(id, {
      ...input,
      status: input.status ?? "APPLIED", // re-submit for review on edit
      rejectionReason: null,
      updatedAt: new Date().toISOString(),
    });

    return updated!;
  }

  async approveArticle(id: string): Promise<Article> {
    const article = await this.articleRepo.findById(id);
    if (!article) throw ARTICLE_NOT_FOUND();
    if (article.status !== "APPLIED") throw ARTICLE_NOT_APPLIED();

    const updated = await this.articleRepo.update(id, {
      status: "APPROVED",
      rejectionReason: null,
      updatedAt: new Date().toISOString(),
    });

    return updated!;
  }

  async rejectArticle(id: string, reason: string): Promise<Article> {
    if (!reason || reason.trim().length < 3) throw REJECT_REASON_REQUIRED();

    const article = await this.articleRepo.findById(id);
    if (!article) throw ARTICLE_NOT_FOUND();
    if (article.status !== "APPLIED") throw ARTICLE_NOT_APPLIED();

    const updated = await this.articleRepo.update(id, {
      status: "REJECTED",
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    });

    return updated!;
  }

  async deleteArticle(id: string): Promise<boolean> {
    const article = await this.articleRepo.findById(id);
    if (!article) throw ARTICLE_NOT_FOUND();
    return this.articleRepo.delete(id);
  }

  private async enrichArticles(articles: Article[]) {
    const categories = await this.categoryRepo.findAll();
    const users = await this.userRepo.findAll();

    return articles.map((article) => {
      const category = categories.find((c) => c.id === article.categoryId);
      const author = users.find((u) => u.id === article.authorId);
      return {
        ...article,
        categoryName: category?.name ?? "Unknown",
        categorySlug: category?.slug ?? "unknown",
        authorName: author?.name ?? "Unknown",
      };
    });
  }
}
