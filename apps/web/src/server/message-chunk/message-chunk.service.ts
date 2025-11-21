import type { MessageChunkIndex, MessageId, UserId } from "@/types/id";
import {
  MessageChunkData,
  MessageChunkEntity,
  MessageChunkSelect,
} from "@/types/message-chunk";
import type { EncryptionService } from "../encryption/encryption.service";
import type { Db } from "../services/db";
import { MessageChunkRepository } from "./message-chunk.repository";

export class MessageChunkService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly db: Db
  ) {}

  decrypt(entity: MessageChunkEntity): MessageChunkData {
    const text = this.encryptionService.decrypt(entity.textEncrypted);
    const reasoningText = this.encryptionService.decrypt(
      entity.reasoningTextEncrypted
    );
    const data = {
      text,
      reasoningText,
      isDone: entity.isDone,
    } satisfies MessageChunkData;
    return data;
  }

  async create(input: {
    messageId: MessageId;
    index: MessageChunkIndex;
    rawData: string;
    text: string;
    reasoningText: string;
    isDone: boolean;
  }) {
    const { messageId, index, text, rawData, reasoningText, isDone } = input;

    const textEncrypted = this.encryptionService.encrypt(text);
    const rawDataEncrypted = this.encryptionService.encrypt(rawData);
    const reasoningTextEncrypted =
      this.encryptionService.encrypt(reasoningText);

    await this.db.messageChunk.create({
      data: {
        messageId,
        index,
        textEncrypted,
        rawDataEncrypted,
        reasoningTextEncrypted,
        isDone,
      },
      select: { index: true },
    });
  }

  async buildText(input: {
    userId: UserId;
    messageId: MessageId;
  }): Promise<{ text: string; reasoningText: string }> {
    const { userId, messageId } = input;

    const entities = await this.db.messageChunk.findMany({
      where: {
        message: { chat: { userId, deletedAt: null } },
        messageId,
      },
      select: MessageChunkSelect,
      orderBy: { index: "asc" },
    });

    const datas = entities.map((x) => this.decrypt(x));
    const text = datas.map((x) => x.text).join("");
    const reasoningText = datas.map((x) => x.reasoningText).join("");
    return { text, reasoningText };
  }

  async hardDeleteMessageChunks() {
    const messageChunkRepository = new MessageChunkRepository(this.db);

    const res = await messageChunkRepository.hardDeleteMessageChunks();
    console.warn(`Successfully hard deleted ${res.count} messageChunks.`);
  }
}
