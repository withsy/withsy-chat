import { createTRPCClient, httpLink } from "@trpc/client";
import SuperJSON from "superjson";
import type { AppRouter } from "../../web/src/server/app/app.router";

export function createTrpcClient() {
  let apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("API_URL must exist.");
  }

  if (apiUrl.endsWith("/")) {
    apiUrl = apiUrl.slice(0, -1);
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY must exist.");
  }

  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        transformer: SuperJSON,
        url: `${apiUrl}/api/trpc`,
        headers: {
          "X-Api-Key": apiKey,
        },
      }),
    ],
  });

  return trpcClient;
}
