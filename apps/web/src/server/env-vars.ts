import z from "zod";

export const NodeEnv = z.enum(["development", "production"]);
export type NodeEnv = z.infer<typeof NodeEnv>;

export const ApiUrl = z
  .url()
  .transform((x) => (x.endsWith("/") ? x.slice(0, -1) : x));
export type ApiUrl = z.infer<typeof ApiUrl>;

export const EnvVars = z.object({
  NODE_ENV: NodeEnv,
  TZ: z.literal("UTC"),
  NEXTAUTH_URL: ApiUrl,
  NEXTAUTH_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  API_URL: ApiUrl,
  API_KEY: z.string().min(1),
});
export type EnvVars = z.infer<typeof EnvVars>;
