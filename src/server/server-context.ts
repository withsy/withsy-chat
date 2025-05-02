import type { UserId } from "@/types/id";
import { service, type ServiceRegistry } from "./service-registry";

export type ServerContext = {
  service: ServiceRegistry;
  userId: UserId;
};

export async function createServerContext(input: {
  userId: UserId;
}): Promise<ServerContext> {
  const { userId } = input;
  return { service, userId };
}
