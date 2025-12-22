import { Injectable, Logger } from "@nestjs/common";
import { DbService } from "../db/db-service";
import { EncryptionService } from "../encryption/encryption-service";
import { RefreshTokenRepo } from "./refresh-token-repo";

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async save(input: {
    provider: string;
    providerAccountId: string;
    refreshToken: string;
  }) {
    try {
      const refreshTokenRepo = new RefreshTokenRepo(this.dbService.db);
      await refreshTokenRepo.createOrUpdate(input);
    } catch (e) {
      const { provider, providerAccountId, refreshToken } = input;

      const refreshTokenEncrypted =
        this.encryptionService.encrypt(refreshToken);
      this.logger.error({
        message: "Failed to save refresh token.",
        provider,
        providerAccountId,
        refreshTokenEncrypted,
      });

      throw e;
    }
  }
}
