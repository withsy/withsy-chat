import { Injectable } from "@nestjs/common";
import { UserId } from "src/user/user-schemas";
import { ChatList, ChatListOutput } from "./chat-schemas";

@Injectable()
export class ChatService {
  async list(userId: UserId, input: ChatList): Promise<ChatListOutput> {}
}
