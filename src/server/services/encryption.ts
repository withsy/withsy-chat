import { Encryption } from "../encryption";
import type { ServiceRegistry } from "../service-registry";

export class EncryptionService {
  private encryption: Encryption;

  constructor(private readonly service: ServiceRegistry) {
    this.encryption = new Encryption(service.env.encryptionKey);
  }

  encrypt(text: string) {
    return this.encryption.encrypt(text);
  }

  decrypt(payloadEncoded: string): string {
    return this.encryption.decrypt(payloadEncoded);
  }
}
