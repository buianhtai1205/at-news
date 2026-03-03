import { handleApiError } from "@/src/core/errors/AppError";
import { CreateCategoryDTO } from "@/src/core/dtos/category.dto";
import { VALIDATION_ERROR } from "@/src/core/errors/errorCodes";
import { getCategoryService } from "@/src/infrastructure/container";
import { requireRole } from "@/src/infrastructure/auth/middleware";

// GET /api/categories — public
export async function GET() {
  try {
    const service = getCategoryService();
    const categories = await service.getAllCategories();
    return Response.json({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/categories — admin only
export async function POST(request: Request) {
  try {
    await requireRole("ADMIN");
    const body = await request.json();
    const parsed = CreateCategoryDTO.safeParse(body);
    if (!parsed.success) {
      throw VALIDATION_ERROR(parsed.error.issues[0]?.message);
    }

    const service = getCategoryService();
    const category = await service.createCategory(parsed.data);

    return Response.json({ category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
