import { Injectable } from "@nestjs/common";
import { E8nService } from "../e8n/e8n-service.js";
import { ChatChunkModel } from "../generated/prisma/models.js";
import { ChatChunkData } from "./chat-chunk-entities.js";

@Injectable()
export class ChatChunkMapper {
  constructor(private readonly e8nService: E8nService) {}

  toData(entity: ChatChunkModel): ChatChunkData {
    const data: ChatChunkData = {
      index: entity.index,
      text: this.e8nService.decrypt(entity.textEncrypted),
      reasoningText: this.e8nService.decrypt(entity.reasoningTextEncrypted),
      isDone: entity.isDone,
    };

    return data;
  }
}
