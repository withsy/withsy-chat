import { Injectable } from "@nestjs/common";
import { tracked } from "@trpc/server";
import { DbService } from "../db/db-service.js";
import { UserId } from "../user/user-schemas.js";
import {
  ChatMessageChunkReceive,
  ChatMessageChunkReceiveOutput,
} from "./chat-message-chunk-entities.js";

@Injectable()
export class ChatMessageChunkService {
  constructor(private readonly dbService: DbService) {}

  async *receive(
    signal: AbortSignal,
    userId: UserId,
    input: ChatMessageChunkReceive,
  ): ChatMessageChunkReceiveOutput {
    const { lastEventId } = input;

    if (signal.aborted) {
      return;
    }

    yield tracked(`${0}`, {
      chatMessageId: "",
      index: 0,
      isDone: true,
      text: "",
      reasoningText: "",
    });
  }
}
