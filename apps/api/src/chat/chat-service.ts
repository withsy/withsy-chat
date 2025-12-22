import { Injectable } from "@nestjs/common";
import { DbService } from "../db/db-service";
import { UserId } from "../user/user-schemas";
import { ChatDecryptor } from "./chat-decryptor";
import { ChatRepo } from "./chat-repo";
import { ChatList, ChatListOutput } from "./chat-schemas";

@Injectable()
export class ChatService {
  constructor(
    private readonly dbService: DbService,
    private readonly chatDecryptor: ChatDecryptor,
  ) {}

  async list(userId: UserId, input: ChatList): Promise<ChatListOutput> {
    const chatRepo = new ChatRepo(this.dbService.db);
    const entities = await chatRepo.list(userId, input);
    const items = entities.map((entity) => this.chatDecryptor.decrypt(entity));
    const nextCursor = items.at(-1)?.id ?? null;

    return {
      items,
      nextCursor,
    };
  }
}
