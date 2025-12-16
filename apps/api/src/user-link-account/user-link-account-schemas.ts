import z from "zod";

export const UserLinkAccountId = z.number().int();
export type UserLinkAccountId = z.infer<typeof UserLinkAccountId>;
