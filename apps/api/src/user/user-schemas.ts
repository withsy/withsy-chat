import { IdempotencyKey } from "src/idempotency-key/idempotency-key-schemas";
import z from "zod";

export const UserId = z.uuid();
export type UserId = z.infer<typeof UserId>;

export const UserLogin = z.object({
  get idempotencyKey() {
    return IdempotencyKey;
  },
  provider: z.string().min(1),
  providerAccountId: z.string().min(1),
  refreshToken: z.string().nullish(),
  name: z.string().nullish(),
  email: z.string().nullish(),
  imageUrl: z.string().nullish(),
});
export type UserLogin = z.infer<typeof UserLogin>;

export const UserLoginOutput = z.object({
  get userId() {
    return UserId;
  },
});
export type UserLoginOutput = z.infer<typeof UserLoginOutput>;
