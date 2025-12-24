import { Injectable } from "@nestjs/common";
import { UserId } from "../user/user-schemas";
import { MessageList, MessageListOutput } from "./message-schemas";

@Injectable()
export class MessageService {
  list(userId: UserId, input: MessageList): Promise<MessageListOutput> {
    throw new Error();
  }
}
