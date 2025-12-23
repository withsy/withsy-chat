import type { TrpcOptions } from "@/lib/trpc";
import { UserPreferencesRaw } from "@repo/common";
import type { inferInput, inferOutput } from "@trpc/tanstack-react-query";
import type { Session } from "next-auth";
import type { Simplify } from "type-fest";
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

export type ChatData = inferOutput<TrpcOptions["chat"]["list"]>["items"][0];

export type Preferences = Simplify<
  Required<inferInput<TrpcOptions["user"]["updatePreferences"]>>
>;

export type PartialUserPreferences = Partial<Preferences>;

export type UserPreferenceKey = keyof PartialUserPreferences;
