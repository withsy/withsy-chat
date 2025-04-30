import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { envConfig } from "../env-config";
import type { ServiceRegistry } from "../service-registry";

export class EncryptionService {
  aes256GcmKey: Buffer;

  constructor(private readonly service: ServiceRegistry) {
    const buffer = Buffer.from(envConfig.encryptionKey, "hex");
    if (buffer.length !== 32)
      throw new Error("Invalid encryption key length. Expected 32 bytes.");

    this.aes256GcmKey = buffer;
  }

  encrypt(text: string): { base64Encoded: string } {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.aes256GcmKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    const payload = Buffer.concat([iv, authTag, encrypted]);
    const base64Encoded = payload.toString("base64");
    return { base64Encoded };
  }

  decrypt(base64Encoded: string): { text: string } {
    const payload = Buffer.from(base64Encoded, "base64");
    const iv = payload.subarray(0, 12);
    const authTag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", this.aes256GcmKey, iv);
    decipher.setAuthTag(authTag);
    const buffer = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    const text = buffer.toString("utf8");
    return { text };
  }
}
