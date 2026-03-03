import { SignJWT, jwtVerify } from "jose";
import { UserRole } from "@/src/core/entities/User";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "at-news-dev-secret-key-change-in-production"
);

const JWT_ISSUER = "at-news";
const JWT_EXPIRATION = "7d";

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  name: string;
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    issuer: JWT_ISSUER,
  });
  return {
    sub: payload.sub as string,
    email: payload.email as string,
    role: payload.role as UserRole,
    name: payload.name as string,
  };
}
