import type { UserId } from "@/types/user";
import admin from "firebase-admin";
import fs from "fs";
import { Readable } from "node:stream";
import type { ServiceRegistry } from "../service-registry";

export type Bucket = ReturnType<admin.storage.Storage["bucket"]>;

const BUCKET_NAME = "withsy-c3106.firebasestorage.app";

export class FirebaseService {
  private app: admin.app.App;
  private storage: admin.storage.Storage;
  private bucket: Bucket;

  constructor(private readonly service: ServiceRegistry) {
    const serviceAccount = JSON.parse(service.env.firebaseServiceAccountKey);
    const credential = admin.credential.cert(serviceAccount);
    this.app = admin.initializeApp({
      credential,
    });
    this.storage = this.app.storage();
    this.bucket = this.storage.bucket(BUCKET_NAME);
  }

  async upload(input: {
    userId: UserId;
    image: File;
  }): Promise<{ fileName: string }> {
    const { userId, image } = input;

    const arrayBuffer = await image.arrayBuffer();
    await fs.promises.writeFile(image.name, Buffer.from(arrayBuffer));

    const fileName = `${userId}/${image.name}`;
    const writable = this.bucket
      .file(fileName)
      .createWriteStream({ metadata: { contentType: image.type } });

    const readable = readableStreamToNodeReadable(image.stream());

    await new Promise<void>((resolve, reject) =>
      readable.pipe(writable).on("finish", resolve).on("error", reject)
    );

    return {
      fileName,
    };
  }
}

function readableStreamToNodeReadable(
  stream: ReadableStream<Uint8Array>
): Readable {
  const reader = stream.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(Buffer.from(value));
      }
    },
  });
}
