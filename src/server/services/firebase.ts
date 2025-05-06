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

  async delete(filePath: string): Promise<void> {
    try {
      await this.bucket.file(filePath).delete();
    } catch (e) {
      console.error(
        `Firebase file deleting failed. path: ${filePath} error:`,
        e
      );
    }
  }
}
