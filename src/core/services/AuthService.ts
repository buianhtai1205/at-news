import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { IUserRepository } from "@/src/core/repositories/IUserRepository";
import { RegisterInput, LoginInput, AuthResponse } from "@/src/core/dtos/auth.dto";
import { signToken } from "@/src/infrastructure/auth/jwt";
import { INVALID_CREDENTIALS, USER_ALREADY_EXISTS } from "@/src/core/errors/errorCodes";
import { User } from "@/src/core/entities/User";

export class AuthService {
  constructor(private userRepo: IUserRepository) {}

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) throw USER_ALREADY_EXISTS();

    const now = new Date().toISOString();
    const user: User = {
      id: `user_${uuidv4().slice(0, 8)}`,
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 10),
      role: "USER",
      createdAt: now,
      updatedAt: now,
    };

    await this.userRepo.create(user);

    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) throw INVALID_CREDENTIALS();

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw INVALID_CREDENTIALS();

    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    };
  }
}
