import type { UserId } from "@/types/user";
import { app, credential, initializeApp, type storage } from "firebase-admin";
import type { ServiceRegistry } from "../service-registry";

export type Bucket = ReturnType<storage.Storage["bucket"]>;

const BUCKET_NAME = "withsy-c3106.firebasestorage.app";

export class FirebaseService {
  private app: app.App;
  private storage: storage.Storage;
  private bucket: Bucket;

  constructor(private readonly service: ServiceRegistry) {
    const serviceAccount = JSON.parse(service.env.firebaseServiceAccountKey);
    this.app = initializeApp({
      credential: credential.cert(serviceAccount),
    });
    this.storage = this.app.storage();
    this.bucket = this.storage.bucket(BUCKET_NAME);
  }

  async upload(input: { userId: UserId }) {
    this.bucket.upload();
  }
}
