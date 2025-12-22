import { Injectable } from "@nestjs/common";
import { EncryptionService } from "../encryption/encryption-service";
import { ChatModel } from "../generated/prisma/models";
import { ChatData } from "./chat-schemas";

@Injectable()
export class ChatDecryptor {
  constructor(private readonly encryptionService: EncryptionService) {}

  decrypt(entity: ChatModel): ChatData {
    const title = this.encryptionService.decrypt(entity.titleEncrypted);

    const data: ChatData = {
      id: entity.id,
      title,
      isStarred: entity.isStarred,
      updatedAt: entity.updatedAt,
    };

    return data;
  }
}
