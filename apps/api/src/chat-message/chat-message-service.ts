import { Injectable } from "@nestjs/common";
import { UserId } from "../user/user-schemas";
import {
  ChatMessageList,
  ChatMessageListOutput,
  ChatMessageSend,
  ChatMessageSendOutput,
} from "./chat-message-schemas";

@Injectable()
export class ChatMessageService {
  list(userId: UserId, input: ChatMessageList): Promise<ChatMessageListOutput> {
    throw new Error();
  }

  send(userId: UserId, input: ChatMessageSend): Promise<ChatMessageSendOutput> {
    throw new Error();
  }
}
