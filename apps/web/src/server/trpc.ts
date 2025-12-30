import type { AppRouter } from "@repo/api";
import {
  createTRPCClient,
  httpLink,
  loggerLink,
  type TRPCClient,
} from "@trpc/client";
import type { EnvVars } from "./env-vars";

export function createTrpcClient(envVars: EnvVars): TRPCClient<AppRouter> {
  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (opts) =>
          opts.direction === "down" && opts.result instanceof Error,
      }),
      httpLink({
        url: `${envVars.NEXT_PUBLIC_API_URL}/trpc`,
        headers: {
          "X-Api-Key": envVars.API_KEY,
        },
      }),
    ],
  });

  return trpcClient;
}
