import type { zInfer } from "@/types/common";
import "dotenv/config";
import { z } from "zod";

export const EnvConfig = z.object({
  nodeEnv: z.enum(["development", "production", "test"]),
  databaseUrl: z.string().min(1),
  geminiApiKey: z.string().min(1),
  xaiApiKey: z.string().min(1),
  nextauthUrl: z.string().min(1),
  nextauthSecret: z.string().min(1),
  googleClientId: z.string().min(1),
  googleClientSecret: z.string().min(1),
  encryptionKey: z.string().min(1),
  firebaseServiceAccountKey: z.string().min(1),
});
export type EnvConfig = zInfer<typeof EnvConfig>;

export function loadEnvConfig() {
  try {
    const envConfig = EnvConfig.parse({
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL,
      geminiApiKey: process.env.GEMINI_API_KEY,
      xaiApiKey: process.env.XAI_API_KEY,
      nextauthUrl: process.env.NEXTAUTH_URL,
      nextauthSecret: process.env.NEXTAUTH_SECRET,
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
      encryptionKey: process.env.ENCRYPTION_KEY,
      firebaseServiceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    });
    return envConfig;
  } catch (e) {
    console.log("Environment variable parsing failed.");
    throw e;
  }
}

export const envConfig = loadEnvConfig();
