import { handleApiError } from "@/src/core/errors/AppError";
import { getArticleService } from "@/src/infrastructure/container";
import { requireAuth } from "@/src/infrastructure/auth/middleware";

// GET /api/articles/mine — returns ALL articles belonging to the current user
export async function GET() {
  try {
    const user = await requireAuth();
    const service = getArticleService();

    let articles = await service.getArticlesByAuthor(user.sub);

    // Exclude soft-deleted articles from user view
    articles = articles.filter((a) => a.status !== "DELETED");

    // Sort by newest first
    articles.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return Response.json({ articles });
  } catch (error) {
    return handleApiError(error);
  }
}
