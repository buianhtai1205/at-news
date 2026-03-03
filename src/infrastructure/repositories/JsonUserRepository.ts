import { User } from "@/src/core/entities/User";
import { IUserRepository } from "@/src/core/repositories/IUserRepository";
import { JsonStore } from "../database/JsonStore";

export class JsonUserRepository implements IUserRepository {
  private store = new JsonStore<User>("users.json");

  async findAll(): Promise<User[]> {
    return this.store.findAll();
  }

  async findById(id: string): Promise<User | null> {
    return this.store.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.store.findOneBy((u) => u.email === email);
  }

  async create(user: User): Promise<User> {
    return this.store.create(user);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    return this.store.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
