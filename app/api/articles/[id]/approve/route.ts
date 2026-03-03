import { handleApiError } from "@/src/core/errors/AppError";
import { getArticleService } from "@/src/infrastructure/container";
import { requireRole } from "@/src/infrastructure/auth/middleware";

// POST /api/articles/[id]/approve — admin only
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireRole("ADMIN");
    const service = getArticleService();
    const article = await service.approveArticle(id);
    return Response.json({ article });
  } catch (error) {
    return handleApiError(error);
  }
}
