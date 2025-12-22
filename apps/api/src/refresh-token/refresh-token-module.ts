import { Module } from "@nestjs/common";
import { DbModule } from "../db/db-module";
import { EncryptionModule } from "../encryption/encryption-module";
import { RefreshTokenService } from "./refresh-token-service";

@Module({
  imports: [DbModule, EncryptionModule],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
