import type { AppRouter } from "@/server/trpc/routers/_app";
import {
  httpBatchLink,
  httpLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
} from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import superjson from "superjson";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}`;
}

function getUrl() {
  return `${getBaseUrl()}/api/trpc`;
}

type createTrpcOptions = Parameters<typeof createTRPCNext<AppRouter>>[0];

export const trpcOptions: createTrpcOptions = {
  transformer: superjson,
  config() {
    return {
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
            transformer: superjson,
            url: getUrl(),
          }),
          false: splitLink({
            condition: (op) => op.context.skipBatch === true,
            true: httpLink({
              transformer: superjson,
              url: getUrl(),
            }),
            false: httpBatchLink({
              transformer: superjson,
              url: getUrl(),
            }),
          }),
        }),
      ],
    };
  },
  ssr: false,
};

export const trpc = createTRPCNext<AppRouter>(trpcOptions);
