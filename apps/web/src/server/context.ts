import { EnvVars } from "./env-vars";
import { createTrpcClient } from "./trpc";

function createServerContext() {
  if (typeof window !== "undefined") {
    return null;
  }

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
    throw new Error("Invalid SERVER_CONTEXT.");
  }

  return serverContext;
}
