import { Injectable } from "@nestjs/common";
import { DbHost } from "src/db/db.host";
import { ApiKeyRepo } from "./api-key-repo";

@Injectable()
export class ApiKeyService {
  constructor(private readonly dbHost: DbHost) {}

  async create(): Promise<void> {
    const apiKeyRepo = new ApiKeyRepo(this.dbHost.db);
    await apiKeyRepo.create();
  }

  async validate(input: { apiKey: string }): Promise<boolean> {
    const apiKeyRepo = new ApiKeyRepo(this.dbHost.db);
    return await apiKeyRepo.validate(input);
  }
}
