import { Injectable } from "@nestjs/common";
import { DbService } from "../db/db-service.js";
import { UserId } from "../user/user-schemas.js";
import { ChatEntityMapper } from "./chat-entity-mapper.js";
import { ChatRepo } from "./chat-repo.js";
import {
  ChatData,
  ChatDelete,
  ChatList,
  ChatListOutput,
  ChatUpdate,
} from "./chat-schemas.js";

@Injectable()
export class ChatService {
  constructor(
    private readonly dbService: DbService,
    private readonly chatEntityMapper: ChatEntityMapper,
  ) {}

  async list(userId: UserId, input: ChatList): Promise<ChatListOutput> {
    const chatRepo = new ChatRepo(this.dbService.db);
    const { entities, nextCursor } = await chatRepo.list(userId, input);
    const items = entities.map((entity) =>
      this.chatEntityMapper.toData(entity),
    );

    return {
      items,
      nextCursor,
    };
  }

  async update(userId: UserId, input: ChatUpdate): Promise<ChatData> {
    const chatRepo = new ChatRepo(this.dbService.db);
    const entity = await chatRepo.update(userId, input);
    const data = this.chatEntityMapper.toData(entity);

    return data;
  }

  async delete(userId: UserId, input: ChatDelete): Promise<void> {
    const chatRepo = new ChatRepo(this.dbService.db);
    await chatRepo.delete(userId, input);
  }
}
