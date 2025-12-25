import { Injectable } from "@nestjs/common";
import { ChatMessageModel } from "../generated/prisma/models";
import { ChatMessageData } from "./chat-message-schemas";

@Injectable()
export class ChatMessageEntityMapper {
  toData(entity: ChatMessageModel): ChatMessageData {
    const data: ChatMessageData = {
      id: entity.id,
    };

    return data;
  }
}
