import { E8nService } from "../e8n/e8n-service.js";
import { UserPromptModel } from "../generated/prisma/models.js";
import { UserPromptData } from "./user-prompt-schemas.js";

export class UserPromptMapper {
  constructor(private readonly e8nService: E8nService) {}

  toData(entity: UserPromptModel): UserPromptData {
    const data: UserPromptData = {
      title: this.e8nService.decrypt(entity.titleEncrypted),
      text: this.e8nService.decrypt(entity.textEncrypted),
      isStarred: entity.isStarred,
    };

    return data;
  }
}
