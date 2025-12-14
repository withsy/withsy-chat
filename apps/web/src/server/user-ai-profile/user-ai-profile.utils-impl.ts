import type { UserId } from "@/types/user";
import type { UserAiProfileData } from "@/types/user-ai-profile";
import type { EncryptionService } from "../encryption/encryption.service";
import type { UserAiProfileModel } from "../generated/prisma/models";
import type { ServerContext } from "../server-context";
import { UserAiProfileService } from "./user-ai-profile.service";

export function createService(context: ServerContext): UserAiProfileService {
  const { encryptionService, db } = context;

  return new UserAiProfileService(encryptionService, db);
}

export function createImagePath(input: {
  userId: UserId;
  fileName: string;
}): string {
  const { userId, fileName } = input;
  return `${userId}/${fileName}`;
}

export function imagePathToSource(input: { imagePath: string }): string {
  const { imagePath } = input;
  const parts = imagePath.split("/"); // e.g.) <userId>/<fileName>
  const fileName = parts.at(1) ?? "";
  const imageSource = fileName ? `/api/ai-profiles/${fileName}` : "";
  return imageSource;
}

export function entityToData(
  context: { encryptionService: EncryptionService },
  entity: UserAiProfileModel
): UserAiProfileData {
  const { encryptionService } = context;

  const name = encryptionService.decrypt(entity.nameEncrypted);
  const imagePath = encryptionService.decrypt(entity.imagePathEncrypted);

  const imageSource = imagePathToSource({ imagePath });

  const data: UserAiProfileData = {
    model: entity.model,
    name,
    imageSource,
  };

  return data;
}
