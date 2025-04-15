import type { UserId } from "@/types/user";
import { s, type ServiceRegistry } from "./service-registry";

export type ApiContext = {
  s: ServiceRegistry;
  userId: UserId;
};

export async function createApiContext(): Promise<ApiContext> {
  // TODO: Parse auth header.
  const { id: userId } = await s.user.getSeedUserId_DEV();
  return { s, userId };
}
