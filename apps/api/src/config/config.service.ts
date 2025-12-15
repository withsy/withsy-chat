import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";
import { EnvVars, NodeEnv } from "./config.utils";

@Injectable()
export class ConfigService {
  constructor(
    private readonly nestConfigService: NestConfigService<EnvVars, true>
  ) {}

  get nodeEnv(): NodeEnv {
    return this.nestConfigService.get("NODE_ENV", { infer: true });
  }

  get databaseUrl(): string {
    return this.nestConfigService.get("DATABASE_URL", { infer: true });
  }

  get databaseDirectUrl(): string {
    return this.nestConfigService.get("DATABASE_DIRECT_URL", {
      infer: true,
    });
  }

  get encryptionKey(): string {
    return this.nestConfigService.get("ENCRYPTION_KEY", { infer: true });
  }

  get geminiApiKey(): string {
    return this.nestConfigService.get("GEMINI_API_KEY", { infer: true });
  }

  get xaiApiKey(): string {
    return this.nestConfigService.get("XAI_API_KEY", { infer: true });
  }

  get s3AccessKeyId(): string {
    return this.nestConfigService.get("S3_ACCESS_KEY_ID", { infer: true });
  }

  get s3SecretAccessKey(): string {
    return this.nestConfigService.get("S3_SECRET_ACCESS_KEY", { infer: true });
  }
}
