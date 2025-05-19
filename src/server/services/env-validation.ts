import type { zInfer } from "@/types/common";
import "dotenv/config";
import { z } from "zod";
import type { ServiceRegistry } from "../service-registry";

const EnvValidation = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  XAI_API_KEY: z.string().min(1),
  NEXTAUTH_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  PUBSUB_EMULATOR_HOST: z.optional(z.string().min(1)),
});
type EnvValidation = zInfer<typeof EnvValidation>;

export class EnvValidationService {
  constructor(private readonly service: ServiceRegistry) {}

  validate() {
    try {
      EnvValidation.parse(process.env);
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
      PUBSUB_EMULATOR_HOST?: string;
    }
  }
}
