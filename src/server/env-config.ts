import type { zInfer } from "@/types/common";
import "dotenv/config";
import { z } from "zod";

export const EnvConfig = z.object({
  nodeEnv: z.enum(["development", "production", "test"]),
  databaseUrl: z.string(),
  geminiApiKey: z.string(),
});
export type EnvConfig = zInfer<typeof EnvConfig>;

function load() {
  try {
    return EnvConfig.parse({
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL,
      geminiApiKey: process.env.GEMINI_API_KEY,
    });
  } catch (e) {
    console.log("Environment variable parsing failed.");
    throw e;
  }
}

export const envConfig = load();
