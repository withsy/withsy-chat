import { Injectable } from "@nestjs/common";
import { E8nService } from "../e8n/e8n-service.js";
import { ChatChunkData, PartialChatChunkModel } from "./chat-chunk-entities.js";

@Injectable()
export class ChatChunkMapper {
  constructor(private readonly e8nService: E8nService) {}

  toData(entity: PartialChatChunkModel): ChatChunkData {
    const data: ChatChunkData = {
      index: entity.index,
      text: this.e8nService.decrypt(entity.textEncrypted),
      reasoningText: this.e8nService.decrypt(entity.reasoningTextEncrypted),
      isSuccess: entity.isSuccess,
    };

    return data;
  }
}
