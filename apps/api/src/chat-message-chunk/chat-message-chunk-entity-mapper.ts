import { Injectable } from "@nestjs/common";
import { E8nService } from "../e8n/e8n-service.js";
import { ChatMessageChunkModel } from "../generated/prisma/models.js";
import { ChatMessageChunkData } from "./chat-message-chunk-entities.js";

@Injectable()
export class ChatMessageChunkEntityMapper {
  constructor(private readonly e8nService: E8nService) {}

  toData(entity: ChatMessageChunkModel): ChatMessageChunkData {
    const data: ChatMessageChunkData = {
      index: entity.index,
      text: this.e8nService.decrypt(entity.textEncrypted),
      reasoningText: this.e8nService.decrypt(entity.reasoningTextEncrypted),
      isDone: entity.isDone,
    };

    return data;
  }
}
