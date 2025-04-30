import { z } from "zod";
import type { zInfer } from "./common";

export const Model = z.enum([
  "gemini-2.0-flash",
  "gemini-1.5-pro",
  "gpt-4o",
  "grok-3-mini-beta",
]);
export type Model = zInfer<typeof Model>;

export const ModelProvider = z.enum(["google-gen-ai", "open-ai", "x-ai"]);
export type ModelProvider = zInfer<typeof ModelProvider>;

export const ModelProviderMap = {
  "gemini-2.0-flash": "google-gen-ai",
  "gemini-1.5-pro": "google-gen-ai",
  "gpt-4o": "open-ai",
  "grok-3-mini-beta": "x-ai",
} satisfies Record<Model, ModelProvider>;
export type ModelProviderMap = typeof ModelProviderMap;
