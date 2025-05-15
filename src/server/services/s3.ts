import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
  type CompleteMultipartUploadCommandOutput,
  type DeleteObjectCommandOutput,
  type GetObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import type { Readable } from "node:stream";
import type { ServiceRegistry } from "../service-registry";

const PROD_ENDPOINT = "https://nsrzjvlxrwyckjfmfzih.supabase.co/storage/v1/s3";
const DEV_ENDPOINT = "https://iexsdnahybucxvjpsrol.supabase.co/storage/v1/s3";

export class S3Service {
  private client: S3Client;

  constructor(private readonly service: ServiceRegistry) {
    this.client = new S3Client({
      forcePathStyle: true,
      region: "us-east-2",
      endpoint:
        process.env.NODE_ENV === "production" ? PROD_ENDPOINT : DEV_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async getObject(input: {
    bucket: string;
    key: string;
  }): Promise<GetObjectCommandOutput> {
    const { bucket, key } = input;
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await this.client.send(command);
    return response;
  }

  async putObjectStream(input: {
    bucket: string;
    key: string;
    contentType: string;
    stream: Readable;
  }): Promise<CompleteMultipartUploadCommandOutput> {
    const { bucket, key, contentType, stream } = input;
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: stream,
        ContentType: contentType,
      },
    });
    const response = await upload.done();
    return response;
  }

  async deleteObject(input: {
    bucket: string;
    key: string;
  }): Promise<DeleteObjectCommandOutput> {
    const { bucket, key } = input;
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await this.client.send(command);
    return response;
  }
}
