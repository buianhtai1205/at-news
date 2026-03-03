import { handleApiError } from "@/src/core/errors/AppError";
import { RejectArticleDTO } from "@/src/core/dtos/article.dto";
import { VALIDATION_ERROR } from "@/src/core/errors/errorCodes";
import { getArticleService } from "@/src/infrastructure/container";
import { requireRole } from "@/src/infrastructure/auth/middleware";

// POST /api/articles/[id]/reject — admin only
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireRole("ADMIN");
    const body = await request.json();
    const parsed = RejectArticleDTO.safeParse(body);
    if (!parsed.success) {
      throw VALIDATION_ERROR(parsed.error.issues[0]?.message);
    }

    const service = getArticleService();
    const article = await service.rejectArticle(id, parsed.data.reason);
    return Response.json({ article });
  } catch (error) {
    return handleApiError(error);
  }
}
