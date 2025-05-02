import { z } from "zod";
import type { zInfer } from "./common";
import { UserId, UserLinkAccountId } from "./id";

export const Entity = z.object({
  id: UserLinkAccountId,
  userId: UserId,
  provider: z.string(),
  providerAccountId: z.string(),
  createdAt: z.date(),
});
export type Entity = zInfer<typeof Entity>;
