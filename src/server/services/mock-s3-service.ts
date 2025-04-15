import { StatusCodes } from "http-status-codes";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { HttpApiError, parseMessageFromUnknown } from "../error";
import type { ServiceRegistry } from "../service-registry";

export const MOCK_S3_INFO = {
  baseDir: "./temp/api/s3",
  baseUrl_DEV: "http://localhost:3000",
};

export class UploadFileError extends HttpApiError<{ fileName: string }> {
  constructor(message: string, fileName: string) {
    super(503, message, {
      extra: {
        fileName,
      },
    });
  }
}

export type FileInfo = { fileUri: string; mimeType: string };

export class MockS3Service {
  private init: Promise<void>;

  constructor(private readonly s: ServiceRegistry) {
    this.init = (async () => {
      await fs.promises.mkdir(MOCK_S3_INFO.baseDir, { recursive: true });
    })();
  }

  async uploads(input: { files: File[] }) {
    await this.init;
    const { files } = input;
    const fileInfos: FileInfo[] = [];
    const errors: UploadFileError[] = [];
    for (const file of files) {
      try {
        const fileNameWithoutExt = randomUUID();
        const fileExt = getFileExtension(file);
        const fileName = fileExt
          ? `${fileNameWithoutExt}.${fileExt}`
          : fileNameWithoutExt;
        const filePath = path.resolve(MOCK_S3_INFO.baseDir, fileName);
        const writeStream = fs.createWriteStream(filePath);

        const reader = file.stream().getReader();
        const readStream = new Readable({
          async read() {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  this.push(null);
                  break;
                }
                this.push(Buffer.from(value));
              }
            } catch (e) {
              // TODO: Parse error type.
              this.destroy(new Error(parseMessageFromUnknown(e)));
            } finally {
              reader.releaseLock();
            }
          },
        });

        await pipeline(readStream, writeStream);
        fileInfos.push({
          // TODO: Public URL.
          fileUri: `${MOCK_S3_INFO.baseUrl_DEV}/api/s3/${fileName}`,
          mimeType: file.type,
        });
      } catch (e) {
        // TODO: Parse error type.
        errors.push(new UploadFileError(parseMessageFromUnknown(e), file.name));
      }
    }

    if (errors.length > 0)
      throw new HttpApiError(
        StatusCodes.SERVICE_UNAVAILABLE,
        "File upload failed.",
        { errors }
      );

    return { fileInfos };
  }
}

function getFileExtension(file: File): string | null {
  const parts = file.name.split(".");
  const last = parts.pop();
  return last ? last.toLowerCase() : null;
}
