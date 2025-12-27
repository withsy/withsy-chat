import { z } from "zod";

export const Role = z.enum(["user", "model", "system"]);
export type Role = z.infer<typeof Role>;

export const GoogleGenAiRole = z.enum(["user", "model"]);
export type GoogleGenAiRole = z.infer<typeof GoogleGenAiRole>;

export const GoogleGenAiRoleMap = {
  user: "user",
  model: "model",
  system: "user",
} satisfies Record<Role, GoogleGenAiRole>;
export type GoogleGenAiRoleMap = typeof GoogleGenAiRoleMap;

export const OpenAiRole = z.enum(["user", "assistant", "system"]);
export type OpenAiRole = z.infer<typeof OpenAiRole>;

export const OpenAiRoleMap = {
  user: "user",
  model: "assistant",
  system: "system",
} satisfies Record<Role, OpenAiRole>;
export type OpenAiRoleMap = z.infer<typeof OpenAiRoleMap>;
