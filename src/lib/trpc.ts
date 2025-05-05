import type { AppRouter } from "@/server/trpc/routers/_app";
import { QueryClient } from "@tanstack/react-query";
import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  loggerLink,
  splitLink,
  type TRPCLink,
} from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { SuperJSON } from "superjson";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}`;
}

function getUrl() {
  return `${getBaseUrl()}/api/trpc`;
}

let csrfToken: string | null = null;
export const setTrpcCsrfToken = (token: string) => {
  csrfToken = token;
};

const commonLinkOptions = {
  transformer: SuperJSON,
  url: getUrl(),
  headers: () => {
    if (csrfToken) {
      return {
        "X-CSRF-Token": csrfToken,
      };
    }

    return {};
  },
};

const links: TRPCLink<AppRouter>[] = [
  loggerLink({
    enabled: (opts) =>
      (process.env.NODE_ENV === "development" &&
        typeof window !== "undefined") ||
      (opts.direction === "down" && opts.result instanceof Error),
  }),
  splitLink({
    condition: (op) => op.context.skipBatch === true,
    true: httpLink(commonLinkOptions),
    false: httpBatchLink(commonLinkOptions),
  }),
];

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;
export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function createTrpcClient() {
  return createTRPCClient<AppRouter>({
    links,
  });
}
