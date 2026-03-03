import { JsonArticleRepository } from "@/src/infrastructure/repositories/JsonArticleRepository";
import { JsonUserRepository } from "@/src/infrastructure/repositories/JsonUserRepository";
import { JsonCategoryRepository } from "@/src/infrastructure/repositories/JsonCategoryRepository";
import { AuthService } from "@/src/core/services/AuthService";
import { ArticleService } from "@/src/core/services/ArticleService";
import { CategoryService } from "@/src/core/services/CategoryService";

// Repository singletons
const userRepo = new JsonUserRepository();
const articleRepo = new JsonArticleRepository();
const categoryRepo = new JsonCategoryRepository();

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
