import { handleApiError } from "@/src/core/errors/AppError";
import { getAuthUser } from "@/src/infrastructure/auth/middleware";
import { TOKEN_INVALID } from "@/src/core/errors/errorCodes";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) throw TOKEN_INVALID();

    return Response.json({
      user: {
        id: user.sub,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
