import { handleApiError } from "@/src/core/errors/AppError";
import { CreateArticleDTO } from "@/src/core/dtos/article.dto";
import { VALIDATION_ERROR } from "@/src/core/errors/errorCodes";
import { getArticleService } from "@/src/infrastructure/container";
import { requireAuth, getAuthUser } from "@/src/infrastructure/auth/middleware";

// GET /api/articles — public: published only; authed admin: all
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const authorId = searchParams.get("authorId");
    const categoryId = searchParams.get("categoryId");

    const service = getArticleService();
    const user = await getAuthUser();

    let articles;

    if (user?.role === "ADMIN" && status) {
      articles = await service.getAllArticles();
      articles = articles.filter((a) => a.status === status);
    } else if (user && authorId === user.sub) {
      articles = await service.getArticlesByAuthor(user.sub);
    } else {
      articles = await service.getPublishedArticles();
    }

    if (categoryId) {
      articles = articles.filter((a) => a.categoryId === categoryId);
    }

    // Sort by newest first
    articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return Response.json({ articles });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/articles — create new article (authed)
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = CreateArticleDTO.safeParse(body);
    if (!parsed.success) {
      throw VALIDATION_ERROR(parsed.error.issues[0]?.message);
    }

    const service = getArticleService();
    const article = await service.createArticle(parsed.data, user);

    return Response.json({ article }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
