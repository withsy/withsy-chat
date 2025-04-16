import { UserSession, type UserId } from "@/types/user";
import type { Session } from "next-auth";
import { s, type ServiceRegistry } from "./service-registry";

export type ApiContext = {
  s: ServiceRegistry;
  userId: UserId;
};

export async function createApiContext(session: Session): Promise<ApiContext> {
  const userSession = await UserSession.parseAsync(session);
  return { s, userId: userSession.user.id };
}
