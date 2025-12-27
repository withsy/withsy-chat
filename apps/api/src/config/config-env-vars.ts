import z from "zod";

export const NodeEnv = z.enum(["production", "development"]);
export type NodeEnv = z.infer<typeof NodeEnv>;

export const EnvVars = z.object({
  NODE_ENV: NodeEnv,
  TZ: z.literal("UTC"),
  DATABASE_URL: z.string().min(1),
  DATABASE_DIRECT_URL: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  XAI_API_KEY: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
});
export type EnvVars = z.infer<typeof EnvVars>;
