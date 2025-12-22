import type { TrpcOptions } from "@/lib/trpc";
import { UserPreferencesRaw } from "@repo/common";
import type { inferOutput } from "@trpc/tanstack-react-query";
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

export type ChatData = inferOutput<TrpcOptions["chat"]["list"]>["items"][0];
