import { z } from "zod";
import type { zInfer } from "./common";

export const Model = z.enum([
  "gemini-2.5-flash",
  "grok-3",
  "grok-3-mini",
  "grok-3-mini-fast",
]);
export type Model = zInfer<typeof Model>;

export const ModelProvider = z.enum(["google-gen-ai", "open-ai", "x-ai"]);
export type ModelProvider = zInfer<typeof ModelProvider>;

export const ModelProviderMap = {
  "gemini-2.5-flash": "google-gen-ai",
  "grok-3": "x-ai",
  "grok-3-mini": "x-ai",
  "grok-3-mini-fast": "x-ai",
} satisfies Record<Model, ModelProvider>;
export type ModelProviderMap = typeof ModelProviderMap;
