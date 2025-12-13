import type { UserAiProfileData } from "@/types/user-ai-profile";
import type { EncryptionService } from "../encryption/encryption.service";
import type { UserAiProfileModel } from "../generated/prisma/models";
import { UserAiProfileHelper } from "./user-ai-profile.helper";

export class UserAiProfileDecryptor {
  constructor(private readonly encryptionService: EncryptionService) {}

  decrypt(entity: UserAiProfileModel): UserAiProfileData {
    const name = this.encryptionService.decrypt(entity.nameEncrypted);
    const imagePath = this.encryptionService.decrypt(entity.imagePathEncrypted);

    const userAiProfileHelper = new UserAiProfileHelper();
    const imageSource = userAiProfileHelper.createImageSource({ imagePath });

    const data: UserAiProfileData = {
      model: entity.model,
      name,
      imageSource,
    };

    return data;
  }
}
