import { ConfigService } from "src/config/config.service";
import { Encryptor } from "./encryptor";

export class EncryptionService {
  private readonly encryptor: Encryptor;

  constructor(configService: ConfigService) {
    this.encryptor = new Encryptor(configService.encryptionKey);
  }

  encrypt(text: string): string {
    return this.encryptor.encrypt(text);
  }

  decrypt(payloadEncoded: string): string {
    return this.encryptor.decrypt(payloadEncoded);
  }
}
