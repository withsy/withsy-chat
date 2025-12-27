import { Injectable } from "@nestjs/common";
import { EncryptionService } from "../encryption/encryption-service.js";
import { ChatModel } from "../generated/prisma/models.js";
import { ChatData } from "./chat-schemas.js";

@Injectable()
export class ChatEntityMapper {
  constructor(private readonly encryptionService: EncryptionService) {}

  toData(entity: ChatModel): ChatData {
    const title = this.encryptionService.decrypt(entity.titleEncrypted);

    const data: ChatData = {
      id: entity.id,
      title,
      isStarred: entity.isStarred,
      updatedAt: entity.updatedAt,
      type: entity.type,
      userPromptId: entity.userPromptId,
    };

    return data;
  }
}
