import { handleApiError } from "@/src/core/errors/AppError";
import { getProfileRepo } from "@/src/infrastructure/container";
import { requireAuth } from "@/src/infrastructure/auth/middleware";

// POST /api/profile/subscribe — mock subscribe (toggle subscription)
export async function POST() {
  try {
    const user = await requireAuth();
    const profileRepo = getProfileRepo();

    // Get current profile
    let profile = await profileRepo.findByUserId(user.sub);

    if (!profile) {
      // Create profile if not exists
      profile = await profileRepo.upsert({
        userId: user.sub,
        isSubscribed: true,
        balance: 0,
        subscribedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      profile = await profileRepo.updateSubscription(user.sub, !profile.isSubscribed);
    }

    return Response.json({
      profile: {
        userId: profile!.userId,
        isSubscribed: profile!.isSubscribed,
        balance: profile!.balance,
        subscribedAt: profile!.subscribedAt,
      },
      message: profile!.isSubscribed
        ? "Successfully subscribed to AT-News Pro!"
        : "Subscription cancelled.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
