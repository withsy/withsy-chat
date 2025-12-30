import { Injectable } from "@nestjs/common";
import { tracked } from "@trpc/server";
import { DbService } from "../db/db-service.js";
import { E8nService } from "../e8n/e8n-service.js";
import { UserId } from "../user/user-schemas.js";
import {
  ChatChunkReceive,
  ChatChunkReceiveOutput,
} from "./chat-chunk-entities.js";
import { ChatChunkRepo } from "./chat-chunk-repo.js";

@Injectable()
export class ChatChunkService {
  constructor(
    private readonly dbService: DbService,
    private readonly e8nService: E8nService,
  ) {}

  async *receive(
    signal: AbortSignal,
    userId: UserId,
    input: ChatChunkReceive,
  ): ChatChunkReceiveOutput {
    const { chatId, chatMessageId, lastEventId } = input;

    const chatChunkRepo = new ChatChunkRepo(this.dbService.db);

    let lastIndex = lastEventId ?? 0;
    let isSuccess: boolean | null = null;
    while (true) {
      const isCompleted = isSuccess !== null;
      if (signal.aborted || isCompleted) {
        break;
      }

      const entities = await chatChunkRepo.list(userId, {
        chatId,
        chatMessageId,
        index: lastIndex + 1,
      });

      for (const entity of entities) {
        yield tracked(`${entity.index}`, {
          index: entity.index,
          text: this.e8nService.decrypt(entity.textEncrypted),
          reasoningText: this.e8nService.decrypt(entity.reasoningTextEncrypted),
          isSuccess: entity.isSuccess,
        });

        lastIndex = entity.index;
        isSuccess = entity.isSuccess;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
