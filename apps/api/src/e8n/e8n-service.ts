import { Injectable } from "@nestjs/common";
import { ConfigService } from "../config/config-service.js";
import { Encryptor } from "./encryptor.js";

@Injectable()
export class E8nService {
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
