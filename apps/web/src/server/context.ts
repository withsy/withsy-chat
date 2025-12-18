import { EnvVars } from "./env-vars";
import { createTrpcClient } from "./trpc";
import { checkTimeZoneUtc } from "./utils";

function createServerContext() {
  if (typeof window !== "undefined") {
    return null;
  }

  checkTimeZoneUtc();

  const envVars = EnvVars.parse(process.env);
  const trpc = createTrpcClient(envVars);

  return {
    envVars,
    trpc,
  };
}

const serverContext = createServerContext();

type ServerContext = NonNullable<typeof serverContext>;

export function getServerContext(): ServerContext {
  if (!serverContext) {
    throw new Error("Invalid server context.");
  }

  return serverContext;
}
