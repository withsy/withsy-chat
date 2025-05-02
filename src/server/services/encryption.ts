import type { zInfer } from "@/types/common";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { z } from "zod";
import type { ServiceRegistry } from "../service-registry";

const EncryptionPayload = z.object({
  algorithm: z.literal("aes-256-gcm"),
  ivEncoded: z.string(),
  authTagEncoded: z.string(),
  encryptedEncoded: z.string(),
});
type EncryptionPayload = zInfer<typeof EncryptionPayload>;

export class EncryptionService {
  private aes256GcmKey: Buffer;

  emptyStringEncrypted: string;

  constructor(private readonly service: ServiceRegistry) {
    const buffer = Buffer.from(this.service.env.encryptionKey, "hex");
    if (buffer.length !== 32)
      throw new Error("Invalid encryption key length. Expected 32 bytes.");

    this.aes256GcmKey = buffer;
    this.emptyStringEncrypted = this.encrypt("");
  }

  encrypt(text: string) {
    const iv = randomBytes(12);
    const algorithm = "aes-256-gcm";
    const cipher = createCipheriv(algorithm, this.aes256GcmKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    const payload = {
      algorithm,
      ivEncoded: iv.toString("base64"),
      authTagEncoded: authTag.toString("base64"),
      encryptedEncoded: encrypted.toString("base64"),
    } satisfies EncryptionPayload;
    const payloadString = JSON.stringify(payload);
    const payloadEncoded = Buffer.from(payloadString).toString("base64");
    return payloadEncoded;
  }

  decrypt(payloadEncoded: string): string {
    try {
      const payloadString = Buffer.from(payloadEncoded, "base64").toString(
        "utf8"
      );
      const payloadRaw = JSON.parse(payloadString);
      const payload = EncryptionPayload.parse(payloadRaw);
      const { algorithm } = payload;
      const iv = Buffer.from(payload.ivEncoded, "base64");
      const authTag = Buffer.from(payload.authTagEncoded, "base64");
      const encrypted = Buffer.from(payload.encryptedEncoded, "base64");
      const decipher = createDecipheriv(algorithm, this.aes256GcmKey, iv);
      decipher.setAuthTag(authTag);
      const textBuffer = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);
      const text = textBuffer.toString("utf8");
      return text;
    } catch (e) {
      console.error("Decryption failed. error:", e);
      throw new Error("Decryption failed.");
    }
  }
}
