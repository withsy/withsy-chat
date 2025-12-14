import type { Db } from "../services/db";
import { ApiKeyRepo } from "./api-key.repo";

export class ApiKeyService {
  constructor(private readonly db: Db) {}

  async createApiKey() {
    const apiKeyRepo = new ApiKeyRepo(this.db);
    return await apiKeyRepo.createApiKey();
  }

  async validateApiKey(input: { apiKey: string }) {
    const apiKeyRepo = new ApiKeyRepo(this.db);
    return await apiKeyRepo.validateApiKey(input);
  }
}
