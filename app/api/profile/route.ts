import { handleApiError } from "@/src/core/errors/AppError";
import { getProfileRepo } from "@/src/infrastructure/container";
import { requireAuth } from "@/src/infrastructure/auth/middleware";

// GET /api/profile — get current user's profile (balance, subscription)
export async function GET() {
  try {
    const user = await requireAuth();
    const profileRepo = getProfileRepo();
    const profile = await profileRepo.findByUserId(user.sub);

    return Response.json({
      profile: profile
        ? {
            userId: profile.userId,
            isSubscribed: profile.isSubscribed,
            balance: profile.balance,
            subscribedAt: profile.subscribedAt,
          }
        : {
            userId: user.sub,
            isSubscribed: false,
            balance: 0,
            subscribedAt: null,
          },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
