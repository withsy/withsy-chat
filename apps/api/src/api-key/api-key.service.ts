import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "src/config/config.service";
import { DbHost } from "src/db/db.host";
import { ApiKeyRepo } from "./api-key-repo";
import { generateApiKey, getDevApiKey } from "./api-key-utils";

@Injectable()
export class ApiKeyService implements OnModuleInit {
  constructor(
    private readonly dbHost: DbHost,
    private readonly configService: ConfigService
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.configService.nodeEnv === "development") {
      await this.ensureDevApiKey();
    }
  }

  private async ensureDevApiKey() {
    await this.dbHost.db.$transaction(async (tx) => {
      const apiKeyRepo = new ApiKeyRepo(tx);
      const apiKey = getDevApiKey();

      if (!(await apiKeyRepo.validate({ apiKey }))) {
        await apiKeyRepo.create({ apiKey });
      }
    });
  }

  async create(): Promise<void> {
    const apiKeyRepo = new ApiKeyRepo(this.dbHost.db);
    await apiKeyRepo.create({
      apiKey: generateApiKey(),
    });
  }

  async validate(input: { apiKey: string }): Promise<boolean> {
    const apiKeyRepo = new ApiKeyRepo(this.dbHost.db);
    return await apiKeyRepo.validate(input);
  }
}
