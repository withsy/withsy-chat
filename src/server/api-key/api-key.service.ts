import type { Db } from "../services/db";
import { ApiKeyRepository } from "./api-key.repository";

export class ApiKeyService {
  constructor(private readonly db: Db) {}

  async validateToken(input: { apiKey: string }) {
    const apiKeyRepository = new ApiKeyRepository(this.db);
    return await apiKeyRepository.validateToken(input);
  }
}
