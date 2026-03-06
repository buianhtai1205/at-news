import { SupabaseArticleRepository } from "@/src/infrastructure/repositories/SupabaseArticleRepository";
import { SupabaseUserRepository } from "@/src/infrastructure/repositories/SupabaseUserRepository";
import { SupabaseCategoryRepository } from "@/src/infrastructure/repositories/SupabaseCategoryRepository";
import { AuthService } from "@/src/core/services/AuthService";
import { ArticleService } from "@/src/core/services/ArticleService";
import { CategoryService } from "@/src/core/services/CategoryService";

// Repository singletons (Supabase)
const userRepo = new SupabaseUserRepository();
const articleRepo = new SupabaseArticleRepository();
const categoryRepo = new SupabaseCategoryRepository();

// Service singletons
const authService = new AuthService(userRepo);
const articleService = new ArticleService(articleRepo, categoryRepo, userRepo);
const categoryService = new CategoryService(categoryRepo, articleRepo);

export function getAuthService() {
  return authService;
}

export function getArticleService() {
  return articleService;
}

export function getCategoryService() {
  return categoryService;
}
