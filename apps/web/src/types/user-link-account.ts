import { z } from "zod";
import type { zInfer } from "./common";
import { UserId, UserLinkAccountId } from "./id";

export const UserLinkAccountEntity = z.object({
  id: UserLinkAccountId,
  userId: UserId,
  provider: z.string(),
  providerAccountId: z.string(),
  createdAt: z.date(),
});
export type UserLinkAccountEntity = zInfer<typeof UserLinkAccountEntity>;
