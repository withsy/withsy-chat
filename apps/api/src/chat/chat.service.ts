import { Injectable } from "@nestjs/common";
import { ChatList, ChatListOutput } from "./chat-schemas";

@Injectable()
export class ChatService {
  async list(input: ChatList): Promise<ChatListOutput> {}
}
