import { Encryptor } from "./encryptor";

export class EncryptionService {
  #encryptor = new Encryptor(process.env.ENCRYPTION_KEY);

  encrypt(text: string) {
    return this.#encryptor.encrypt(text);
  }

  decrypt(payloadEncoded: string): string {
    return this.#encryptor.decrypt(payloadEncoded);
  }
}
