import { Encryptor } from "./encryptor";

export class EncryptionService {
  #encryptor: Encryptor;

  constructor() {
    const { ENCRYPTION_KEY } = process.env;
    if (!ENCRYPTION_KEY) {
      throw new Error("Invalid ENCRYPTION_KEY.");
    }

    this.#encryptor = new Encryptor(ENCRYPTION_KEY);
  }

  encrypt(text: string): string {
    return this.#encryptor.encrypt(text);
  }

  decrypt(payloadEncoded: string): string {
    return this.#encryptor.decrypt(payloadEncoded);
  }
}
