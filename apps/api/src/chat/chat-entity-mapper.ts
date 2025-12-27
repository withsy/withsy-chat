import { Injectable } from "@nestjs/common";
import { E8nService } from "../e8n/e8n-service.js";
import { ChatModel } from "../generated/prisma/models.js";
import { ChatData } from "./chat-schemas.js";

@Injectable()
export class ChatEntityMapper {
  constructor(private readonly e8nService: E8nService) {}

  toData(entity: ChatModel): ChatData {
    const title = this.e8nService.decrypt(entity.titleEncrypted);

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
