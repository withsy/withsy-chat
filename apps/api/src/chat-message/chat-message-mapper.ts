import { Injectable } from "@nestjs/common";
import { Role } from "../common-schemas.js";
import { E8nService } from "../e8n/e8n-service.js";
import { ChatMessageModel } from "../generated/prisma/models.js";
import { ChatMessageRepo } from "./chat-message-repo.js";
import { ChatMessageData } from "./chat-message-schemas.js";

@Injectable()
export class ChatMessageMapper {
  constructor(private readonly e8nService: E8nService) {}

  toData(
    entity: Awaited<ReturnType<ChatMessageRepo["list"]>>["entities"][0],
  ): ChatMessageData {
    const data: ChatMessageData = {
      id: entity.id,
      chatId: entity.chatId,
      chat: entity.chat
        ? {
            title: this.e8nService.decrypt(entity.chat.titleEncrypted),
          }
        : null,
      isBookmarked: entity.isBookmarked,
      role: Role.parse(entity.role),
      reasoningText: this.e8nService.decrypt(entity.reasoningTextEncrypted),
      text: this.e8nService.decrypt(entity.textEncrypted),
      status: entity.status,
      model: entity.model,
      createdAt: entity.createdAt,
    };

    return data;
  }
}
