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

  encrypt(text: string) {
    const iv = randomBytes(12);
    const algorithm = "aes-256-gcm";
    const cipher = createCipheriv(algorithm, this.aes256GcmKey, iv);
    const buffer = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const payload = JSON.stringify({
      algorithm,
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64"),
      buffer: buffer.toString("base64"),
    });
    const encrypted = Buffer.from(payload).toString("base64");
    return encrypted;
  }

  /**
   * decrypt(base64Encoded: string): { text: string } {
  try {
    const payload = JSON.parse(Buffer.from(base64Encoded, "base64").toString("utf8"));
    const { iv, authTag, encrypted } = payload;
    const decipher = createDecipheriv(
      payload.algorithm,
      this.aes256GcmKey,
      Buffer.from(iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(authTag, "base64"));
    const buffer = Buffer.concat([
      decipher.update(Buffer.from(encrypted, "base64")),
      decipher.final(),
    ]);
    return { text: buffer.toString("utf8") };
  } catch (error) {
    throw new Error("Decryption failed. Invalid data or authentication tag.");
  }
}
   */
  decrypt(encrypted: string): string {
    try {
      const payload = JSON.parse(
        Buffer.from(encrypted, "base64").toString("utf8")
      );
      const { iv, authTag, buffer, algorithm } = payload;
      const decipher = createDecipheriv(algorithm, this.aes256GcmKey);
      // const iv = payload.subarray(0, 12);
      // const authTag = payload.subarray(12, 28);
      // const encrypted = payload.subarray(28);
      // const decipher = createDecipheriv("aes-256-gcm", this.aes256GcmKey, iv);
      // decipher.setAuthTag(authTag);
      // const buffer = Buffer.concat([
      //   decipher.update(encrypted),
      //   decipher.final(),
      // ]);
      // const text = buffer.toString("utf8");
      // return { text };
    } catch (e) {
      console.error("Decryption failed. error:", e);
      throw new Error("Decryption failed.");
    }
  }
}
