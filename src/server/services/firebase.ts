import admin from "firebase-admin";
import type { ServiceRegistry } from "../service-registry";

export type Bucket = ReturnType<admin.storage.Storage["bucket"]>;

const BUCKET_NAME = "withsy-c3106.firebasestorage.app";

export class FirebaseService {
  private app: admin.app.App;
  private storage: admin.storage.Storage;
  bucket: Bucket;

  constructor(private readonly service: ServiceRegistry) {
    const serviceAccount = JSON.parse(service.env.firebaseServiceAccountKey);
    const credential = admin.credential.cert(serviceAccount);
    this.app = admin.initializeApp({
      credential,
    });
    this.storage = this.app.storage();
    this.bucket = this.storage.bucket(BUCKET_NAME);
  }

  async getSignedUrl(filePath: string): Promise<string> {
    const file = this.bucket.file(filePath);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    return url;
  }

  async delete(filePath: string): Promise<void> {
    try {
      await this.service.firebase.bucket.file(filePath).delete();
    } catch (e) {
      console.error(
        `Firebase file deleting failed. path: ${filePath} error:`,
        e
      );
    }
  }
}
