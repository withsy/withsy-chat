import type { UserId } from "@/types/user";
import camelcaseKeys from "camelcase-keys";
import type { Tx } from "../db/db";
import type { UserAiProfileModel } from "../generated/prisma/models";

export type UpsertOutput = UserAiProfileModel & {
  oldImagePathEncrypted: string | null;
};

export class UserAiProfileRepository {
  constructor(private readonly tx: Tx) {}

  async list(input: { userId: UserId }): Promise<UserAiProfileModel[]> {
    const { userId } = input;

    return await this.tx.userAiProfile.findMany({
      where: {
        userId,
      },
    });
  }

  async upsert(input: {
    userId: UserId;
    model: string;
    nameEncrypted: string;
    imagePathEncrypted: string;
  }): Promise<UpsertOutput> {
    const { userId, model, nameEncrypted, imagePathEncrypted } = input;

    const rows = await this.tx.$queryRaw<Record<string, unknown>[]>`
WITH old AS (
  SELECT image_path_encrypted FROM user_ai_profiles
  WHERE user_id = ${userId}
    AND model = ${model}
) INSERT INTO user_ai_profiles (
  user_id, model, name_encrypted, image_path_encrypted
) VALUES (
  ${userId}, ${model}, ${nameEncrypted}, ${imagePathEncrypted}
) ON CONFLICT (
  user_id, model
) DO UPDATE SET
  name_encrypted = EXCLUDED.name_encrypted,
  image_path_encrypted = EXCLUDED.image_path_encrypted
RETURNING
  *, (SELECT image_path_encrypted FROM old) AS old_image_path_encrypted;
`;

    const output = camelcaseKeys(rows[0]);
    return output as UpsertOutput;
  }
}
