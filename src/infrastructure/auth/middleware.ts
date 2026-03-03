import { cookies } from "next/headers";
import { verifyToken, JwtPayload } from "./jwt";
import { TOKEN_INVALID } from "@/src/core/errors/errorCodes";
import { UserRole } from "@/src/core/entities/User";

const COOKIE_NAME = "at-news-token";

export async function getAuthUser(): Promise<JwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(COOKIE_NAME);
    if (!tokenCookie?.value) return null;
    return await verifyToken(tokenCookie.value);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<JwtPayload> {
  const user = await getAuthUser();
  if (!user) throw TOKEN_INVALID();
  return user;
}

export async function requireRole(role: UserRole): Promise<JwtPayload> {
  const user = await requireAuth();
  if (user.role !== role) {
    const { ADMIN_ONLY, FORBIDDEN } = await import("@/src/core/errors/errorCodes");
    if (role === "ADMIN") throw ADMIN_ONLY();
    throw FORBIDDEN();
  }
  return user;
}

export function setAuthCookie(token: string): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  };
}

export function clearAuthCookie(): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
    },
  };
}
