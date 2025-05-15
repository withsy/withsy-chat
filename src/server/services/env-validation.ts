import type { zInfer } from "@/types/common";
import "dotenv/config";
import { z } from "zod";
import type { ServiceRegistry } from "../service-registry";

const EnvValidation = z.object({
  nodeEnv: z.enum(["development", "production", "test"]),
  databaseUrl: z.string().min(1),
  geminiApiKey: z.string().min(1),
  xaiApiKey: z.string().min(1),
  nextauthUrl: z.string().min(1),
  nextauthSecret: z.string().min(1),
  googleClientId: z.string().min(1),
  googleClientSecret: z.string().min(1),
  encryptionKey: z.string().min(1),
  s3AccessKeyId: z.string().min(1),
  s3SecretAccessKey: z.string().min(1),
  rdsCaCert: z.optional(z.string().min(1)),
});
type EnvValidation = zInfer<typeof EnvValidation>;

export class EnvValidationService {
  constructor(private readonly service: ServiceRegistry) {}

  validate() {
    try {
      EnvValidation.parse({
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL,
        geminiApiKey: process.env.GEMINI_API_KEY,
        xaiApiKey: process.env.XAI_API_KEY,
        nextauthUrl: process.env.NEXTAUTH_URL,
        nextauthSecret: process.env.NEXTAUTH_SECRET,
        googleClientId: process.env.GOOGLE_CLIENT_ID,
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
        encryptionKey: process.env.ENCRYPTION_KEY,
        s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
        s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        rdsCaCert: process.env.RDS_CA_CERT,
      });
    } catch (e) {
      console.log("Environment variable parsing failed.");
      throw e;
    }
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      GEMINI_API_KEY: string;
      XAI_API_KEY: string;
      NEXTAUTH_URL?: string;
      NEXTAUTH_SECRET?: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      ENCRYPTION_KEY: string;
      S3_ACCESS_KEY_ID: string;
      S3_SECRET_ACCESS_KEY: string;
      RDS_CA_CERT?: string;
    }
  }
}
