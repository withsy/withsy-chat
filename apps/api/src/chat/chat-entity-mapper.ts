import { Injectable } from "@nestjs/common";
import { EncryptionService } from "../encryption/encryption-service";
import { ChatModel } from "../generated/prisma/models";
import { ChatData } from "./chat-schemas";

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
    };

    return data;
  }
}
