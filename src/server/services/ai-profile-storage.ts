import { Readable } from "node:stream";
import type { ServiceRegistry } from "../service-registry";

export class AiProfileStorageService {
  private bucketName = "ai-profiles";

  constructor(private readonly service: ServiceRegistry) {}

  /**
   * Must consume the result stream.
   */
  async getStream(input: {
    imagePath: string;
  }): Promise<{ stream: Readable; contentType: string | null } | null> {
    const { imagePath } = input;
    try {
      const res = await this.service.s3.getObject({
        bucket: this.bucketName,
        key: imagePath,
      });
      const contentType = res.ContentType ?? null;
      const stream = res.Body;
      if (!stream) throw new Error("ai profile response body must exist.");
      if (!(stream instanceof Readable))
        throw new Error("ai profile response body must readable stream.");
      return {
        stream,
        contentType,
      };
    } catch (e) {
      console.warn(
        "ai profile getting failed. image path:",
        imagePath,
        "error:",
        e
      );
      return null;
    }
  }

  async putStream(input: {
    imagePath: string;
    contentType: string;
    stream: Readable;
  }) {
    const { imagePath, contentType, stream } = input;
    await this.service.s3.putObjectStream({
      bucket: this.bucketName,
      key: imagePath,
      contentType,
      stream,
    });
  }

  async delete(input: { imagePath: string }) {
    const { imagePath } = input;
    try {
      await this.service.s3.deleteObject({
        bucket: this.bucketName,
        key: imagePath,
      });
    } catch (e) {
      console.warn(
        "ai profile deleting failed. image path:",
        imagePath,
        "error:",
        e
      );
    }
  }
}
