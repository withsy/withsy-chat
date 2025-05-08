import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
  type CompleteMultipartUploadCommandOutput,
  type DeleteObjectCommandOutput,
  type GetObjectCommandOutput,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import type { Readable } from "node:stream";
import type { ServiceRegistry } from "../service-registry";

export class S3Service {
  private client: S3Client;

  constructor(private readonly service: ServiceRegistry) {
    if (service.env.nodeEnv === "production") {
      if (service.env.awsAccessKeyId || service.env.awsSecretAccessKey)
        throw new Error("In Production, please grant Instance Role.");
    }

    let credentials: S3ClientConfig["credentials"] = undefined;
    if (service.env.nodeEnv === "development") {
      if (!service.env.awsAccessKeyId)
        throw new Error("Please set AWS_ACCESS_KEY_ID.");
      if (!service.env.awsSecretAccessKey)
        throw new Error("Please set AWS_SECRET_ACCESS_KEY.");

      credentials = {
        accessKeyId: service.env.awsAccessKeyId,
        secretAccessKey: service.env.awsSecretAccessKey,
      };
    }

    this.client = new S3Client({
      forcePathStyle: true,
      region: "us-east-2",
      credentials,
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
