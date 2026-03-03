import { cookies } from "next/headers";
import { clearAuthCookie } from "@/src/infrastructure/auth/middleware";

export async function POST() {
  const cookie = clearAuthCookie();
  const cookieStore = await cookies();
  cookieStore.set(cookie.name, cookie.value, cookie.options as Parameters<typeof cookieStore.set>[2]);

  return Response.json({ message: "Logged out successfully" });
}
