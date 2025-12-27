import { Injectable } from "@nestjs/common";
import { ChatMessageModel } from "../generated/prisma/models.js";
import { ChatMessageData } from "./chat-message-schemas.js";

@Injectable()
export class ChatMessageEntityMapper {
  toData(entity: ChatMessageModel): ChatMessageData {
    const data: ChatMessageData = {
      id: entity.id,
      chatId: entity.chatId,
    };

    return data;
  }
}
