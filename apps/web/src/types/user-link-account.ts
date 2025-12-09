import { z } from "zod";
import { DateTimeTz, type zInfer } from "./common";
import { UserId } from "./user";

export const UserLinkAccountId = z.number().int();
export type UserLinkAccountId = zInfer<typeof UserLinkAccountId>;

export const UserLinkAccountEntity = z.object({
  get id() {
    return UserLinkAccountId;
  },
  get userId() {
    return UserId;
  },
  provider: z.string(),
  providerAccountId: z.string(),
  get createdAt() {
    return DateTimeTz;
  },
});
export type UserLinkAccountEntity = zInfer<typeof UserLinkAccountEntity>;
