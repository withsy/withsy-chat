import { UserPreferencesRaw } from "@repo/common";
import type { Session } from "next-auth";
import z from "zod";

export interface AuthSession extends Session {
  user: Session["user"] & {
    id: string;
    preferencesRaw: UserPreferencesRaw;
  };
}

export const AuthSession = z.object({
  user: z.object({
    id: z.string(),
    preferencesRaw: UserPreferencesRaw,
  }),
});
