import { cookies } from "next/headers";
import { RegisterDTO } from "@/src/core/dtos/auth.dto";
import { handleApiError } from "@/src/core/errors/AppError";
import { VALIDATION_ERROR } from "@/src/core/errors/errorCodes";
import { getAuthService } from "@/src/infrastructure/container";
import { setAuthCookie } from "@/src/infrastructure/auth/middleware";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RegisterDTO.safeParse(body);
    if (!parsed.success) {
      throw VALIDATION_ERROR(parsed.error.issues[0]?.message);
    }

    const result = await getAuthService().register(parsed.data);

    const cookie = setAuthCookie(result.token);
    const cookieStore = await cookies();
    cookieStore.set(cookie.name, cookie.value, cookie.options as Parameters<typeof cookieStore.set>[2]);

    return Response.json({ user: result.user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
