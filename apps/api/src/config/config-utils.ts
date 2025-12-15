import z from "zod";

const NodeEnv = z.enum(["production", "development"]);
export type NodeEnv = z.infer<typeof NodeEnv>;

const EnvVars = z.object({
  NODE_ENV: NodeEnv,
  TZ: z.string(),
  DATABASE_URL: z.string(),
  DATABASE_DIRECT_URL: z.string(),
  ENCRYPTION_KEY: z.string(),
  GEMINI_API_KEY: z.string(),
  XAI_API_KEY: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
});
export type EnvVars = z.infer<typeof EnvVars>;

export function validate(
  config: Record<string, unknown>
): Record<string, unknown> {
  return EnvVars.parse(config);
}
