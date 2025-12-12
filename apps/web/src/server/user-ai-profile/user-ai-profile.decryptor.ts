import type { UserAiProfileData } from "@/types/user-ai-profile";
import type { EncryptionService } from "../encryption/encryption.service";
import type { UserAiProfileModel } from "../generated/prisma/models";

export class UserAiProfileDecryptor {
  constructor(private readonly encryptionService: EncryptionService) {}

  decrypt(entity: UserAiProfileModel): UserAiProfileData {
    const model = Model.parse(entity.model);
    const name = this.encryptionService.decrypt(entity.nameEncrypted);
    const imagePath = this.encryptionService.decrypt(entity.imagePathEncrypted);
    const imageSource = UserAiProfileService.createImageSource({ imagePath });
    const data: UserAiProfileData = {
      model,
      name,
      imageSource,
    };

    return data;
  }
}
