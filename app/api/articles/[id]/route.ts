import { handleApiError } from "@/src/core/errors/AppError";
import { UpdateArticleDTO } from "@/src/core/dtos/article.dto";
import { VALIDATION_ERROR } from "@/src/core/errors/errorCodes";
import { getArticleService } from "@/src/infrastructure/container";
import { requireAuth, requireRole } from "@/src/infrastructure/auth/middleware";

// GET /api/articles/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = getArticleService();
    const article = await service.getArticleById(id);
    return Response.json({ article });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/articles/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    const body = await request.json();
    const parsed = UpdateArticleDTO.safeParse(body);
    if (!parsed.success) {
      throw VALIDATION_ERROR(parsed.error.issues[0]?.message);
    }

    const service = getArticleService();
    const article = await service.updateArticle(id, parsed.data, user);

    return Response.json({ article });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/articles/[id] — admin only
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireRole("ADMIN");
    const service = getArticleService();
    await service.deleteArticle(id);
    return Response.json({ message: "Article deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
