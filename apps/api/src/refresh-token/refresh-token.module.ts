import { Module } from "@nestjs/common";
import { DbModule } from "src/db/db.module";
import { EncryptionModule } from "src/encryption/encryption.module";
import { RefreshTokenService } from "./refresh-token.service";

@Module({
  imports: [DbModule, EncryptionModule],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
