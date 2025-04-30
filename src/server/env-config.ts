import type { zInfer } from "@/types/common";
import "dotenv/config";
import { z } from "zod";

export const EnvConfig = z.object({
  nodeEnv: z.enum(["development", "production", "test"]),
  databaseUrl: z.string().min(1),
  geminiApiKey: z.string().min(1),
  openaiApiKey: z.string().min(1),
  xaiApiKey: z.string().min(1),
  nextauthUrl: z.string().min(1),
  nextauthSecret: z.string().min(1),
  googleClientId: z.string().min(1),
  googleClientSecret: z.string().min(1),
});
export type EnvConfig = zInfer<typeof EnvConfig>;

function load() {
  try {
    return EnvConfig.parse({
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL,
      geminiApiKey: process.env.GEMINI_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      xaiApiKey: process.env.XAI_API_KEY,
      nextauthUrl: process.env.NEXTAUTH_URL,
      nextauthSecret: process.env.NEXTAUTH_SECRET,
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
  } catch (e) {
    console.log("Environment variable parsing failed.");
    throw e;
  }
}

export const envConfig = load();
