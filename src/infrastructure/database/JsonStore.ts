import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/infrastructure/database/data");

export class JsonStore<T extends { id: string }> {
  private filePath: string;
  private cache: T[] | null = null;

  constructor(fileName: string) {
    this.filePath = path.join(DATA_DIR, fileName);
  }

  private readFile(): T[] {
    if (this.cache) return this.cache;
    try {
      const raw = fs.readFileSync(this.filePath, "utf-8");
      this.cache = JSON.parse(raw) as T[];
      return this.cache;
    } catch {
      this.cache = [];
      return this.cache;
    }
  }

  private writeFile(data: T[]): void {
    this.cache = data;
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async findAll(): Promise<T[]> {
    return [...this.readFile()];
  }

  async findById(id: string): Promise<T | null> {
    return this.readFile().find((item) => item.id === id) ?? null;
  }

  async findBy(predicate: (item: T) => boolean): Promise<T[]> {
    return this.readFile().filter(predicate);
  }

  async findOneBy(predicate: (item: T) => boolean): Promise<T | null> {
    return this.readFile().find(predicate) ?? null;
  }

  async create(item: T): Promise<T> {
    const data = this.readFile();
    data.push(item);
    this.writeFile(data);
    return item;
  }

  async update(id: string, partial: Partial<T>): Promise<T | null> {
    const data = this.readFile();
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) return null;
    data[index] = { ...data[index], ...partial, id }; // never overwrite id
    this.writeFile(data);
    return data[index];
  }

  async delete(id: string): Promise<boolean> {
    const data = this.readFile();
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) return false;
    data.splice(index, 1);
    this.writeFile(data);
    return true;
  }

  /** Invalidate in-memory cache so next read reloads from disk */
  invalidateCache(): void {
    this.cache = null;
  }
}
