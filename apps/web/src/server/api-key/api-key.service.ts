import type { Db } from "../db/db";
import { ApiKeyRepo } from "./api-key.repo";

export class ApiKeyService {
  constructor(private readonly db: Db) {}

  async create(): Promise<void> {
    const apiKeyRepo = new ApiKeyRepo(this.db);
    await apiKeyRepo.create();
  }

  async validate(input: { apiKey: string }): Promise<boolean> {
    const apiKeyRepo = new ApiKeyRepo(this.db);
    return await apiKeyRepo.validate(input);
  }
}
