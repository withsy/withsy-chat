import type { AppRouter } from "@repo/api";
import {
  createTRPCClient,
  httpLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
} from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

export type TrpcOptions = ReturnType<typeof useTRPC>;

const TRPC_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/trpc`;

export function createTrpcClient() {
  return createTRPCClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (opts) =>
          (process.env.NODE_ENV === "development" &&
            typeof window !== "undefined") ||
          (opts.direction === "down" && opts.result instanceof Error),
      }),
      splitLink({
        condition: (op) => op.type === "subscription",
        true: httpSubscriptionLink({
          url: TRPC_API_URL,
          eventSourceOptions: () => {
            return {
              withCredentials: true,
            } satisfies EventSourceInit;
          },
        }),
        false: httpLink({
          url: TRPC_API_URL,
          fetch: (url, options) => {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      }),
    ],
  });
}
