import { Encryption } from "../encryption";

export class EncryptionService {
  private encryption: Encryption;

  constructor() {
    this.encryption = new Encryption(process.env.ENCRYPTION_KEY);
  }

  encrypt(text: string) {
    return this.encryption.encrypt(text);
  }

  decrypt(payloadEncoded: string): string {
    return this.encryption.decrypt(payloadEncoded);
  }
}
