import { handleApiError } from "@/src/core/errors/AppError";
import { UpdateCategoryDTO } from "@/src/core/dtos/category.dto";
import { VALIDATION_ERROR } from "@/src/core/errors/errorCodes";
import { getCategoryService } from "@/src/infrastructure/container";
import { requireRole } from "@/src/infrastructure/auth/middleware";

// GET /api/categories/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = getCategoryService();
    const category = await service.getCategoryById(id);
    return Response.json({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/categories/[id] — admin only
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireRole("ADMIN");
    const body = await request.json();
    const parsed = UpdateCategoryDTO.safeParse(body);
    if (!parsed.success) {
      throw VALIDATION_ERROR(parsed.error.issues[0]?.message);
    }

    const service = getCategoryService();
    const category = await service.updateCategory(id, parsed.data);

    return Response.json({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/categories/[id] — admin only
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireRole("ADMIN");
    const service = getCategoryService();
    await service.deleteCategory(id);
    return Response.json({ message: "Category deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
