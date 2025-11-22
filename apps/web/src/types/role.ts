import { z } from "zod";
import type { zInfer } from "./common";

export const Role = z.enum(["user", "model", "system"]);
export type Role = zInfer<typeof Role>;

export const RoleGoogleGenAi = z.enum(["user", "model"]);
export type RoleGoogleGenAi = zInfer<typeof RoleGoogleGenAi>;

export const RoleGoogleGenAiMap = {
  user: "user",
  model: "model",
  system: "user",
} as const satisfies Record<Role, RoleGoogleGenAi>;
export type RoleGoogleGenAiMap = typeof RoleGoogleGenAiMap;

export const RoleOpenAi = z.enum(["user", "assistant", "system"]);
export type RoleOpenAi = zInfer<typeof RoleOpenAi>;

export const RoleOpenAiMap = {
  user: "user",
  model: "assistant",
  system: "system",
} as const satisfies Record<Role, RoleOpenAi>;
