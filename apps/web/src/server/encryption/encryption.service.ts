import { Encryptor } from "./encryptor";

export class EncryptionService {
  #encryptor: Encryptor;

  constructor() {
    const { ENCRYPTION_SECRET } = process.env;
    if (!ENCRYPTION_SECRET) {
      throw new Error("Invalid ENCRYPTION_SECRET.");
    }

    this.#encryptor = new Encryptor(ENCRYPTION_SECRET);
  }

  encrypt(text: string) {
    return this.#encryptor.encrypt(text);
  }

  decrypt(payloadEncoded: string): string {
    return this.#encryptor.decrypt(payloadEncoded);
  }
}
