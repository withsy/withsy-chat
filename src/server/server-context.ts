import { UserSession, type UserId } from "@/types/user";
import type { Session } from "next-auth";
import { service, type ServiceRegistry } from "./service-registry";

export type ServerContext = {
  service: ServiceRegistry;
  userId: UserId;
};

export async function createServerContext(
  session: Session
): Promise<ServerContext> {
  const userSession = UserSession.parse(session);
  return { service, userId: userSession.user.id };
}
