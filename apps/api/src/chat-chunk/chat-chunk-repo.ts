import { ChatMessageId } from "../chat-message/chat-message-schemas.js";
import { ChatId } from "../chat/chat-schemas.js";
import { AiSendTextOutput } from "../common-schemas.js";
import { Tx } from "../db/db-service.js";
import { E8nService } from "../e8n/e8n-service.js";
import { UserId } from "../user/user-schemas.js";
import {
  ChatChunkIndex,
  PartialChatChunkModel,
} from "./chat-chunk-entities.js";
import { ChatChunkMapper } from "./chat-chunk-mapper.js";

export class ChatChunkRepo {
  constructor(private readonly tx: Tx) {}

  async list(
    userId: UserId,
    input: {
      chatId: ChatId;
      chatMessageId: ChatMessageId;
      index: ChatChunkIndex;
      limit?: number;
    },
  ): Promise<PartialChatChunkModel[]> {
    const { chatId, chatMessageId, index, limit = 20 } = input;

    const entities = await this.tx.chatChunk.findMany({
      where: {
        chatMessage: {
          id: chatMessageId,
          chatId,
          chat: {
            deletedAt: null,
            userId,
            user: {
              deletedAt: null,
            },
          },
        },
      },
      orderBy: {
        index: "asc",
      },
      take: limit,
      cursor: {
        chatMessageId_index: {
          chatMessageId,
          index,
        },
      },
      select: {
        index: true,
        textEncrypted: true,
        reasoningTextEncrypted: true,
        isSuccess: true,
      },
    });

    return entities;
  }

  async calculateTexts(input: {
    userId: UserId;
    chatId: ChatId;
    chatMessageId: ChatMessageId;
    index: number;
    chatChunkMapper: ChatChunkMapper;
  }) {
    const { userId, chatId, chatMessageId, index, chatChunkMapper } = input;

    const texts: string[] = [];
    const reasoningTexts: string[] = [];
    let readIndex = 0;
    while (readIndex < index) {
      const chatChunks = await this.list(userId, {
        chatId,
        chatMessageId,
        index: readIndex + 1,
      });

      chatChunks.forEach((x) => {
        const chatChunkData = chatChunkMapper.toData(x);
        texts.push(chatChunkData.text);
        reasoningTexts.push(chatChunkData.reasoningText);
        readIndex = chatChunkData.index;
      });
    }

    const text = texts.join("");
    const reasoningText = reasoningTexts.join("");

    return {
      text,
      reasoningText,
    };
  }

  async create(
    context: {
      e8nService: E8nService;
    },
    input: {
      chatMessageId: ChatMessageId;
      isSuccess?: boolean;
      index: number;
    } & AiSendTextOutput,
  ): Promise<void> {
    const { e8nService } = context;
    const { chatMessageId, isSuccess, index, text, reasoningText, rawData } =
      input;

    await this.tx.chatChunk.create({
      data: {
        chatMessageId,
        index,
        isSuccess,
        textEncrypted: e8nService.encrypt(text),
        reasoningTextEncrypted: e8nService.encrypt(reasoningText),
        rawDataEncrypted: e8nService.encrypt(rawData),
      },
      select: {},
    });
  }
}
