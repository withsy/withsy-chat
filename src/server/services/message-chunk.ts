import type { MessageChunkIndex, MessageId, UserId } from "@/types/id";
import {
  MessageChunkData,
  MessageChunkEntity,
  MessageChunkSelect,
} from "@/types/message-chunk";
import { getHardDeleteCutoffDate } from "../utils";
import { inject } from "../service-registry";

export class MessageChunkService {
  private readonly encryptionService = inject("encryptionService");
  private readonly db = inject("db");

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

  async onHardDeleteTask() {
    const cutoffDate = getHardDeleteCutoffDate(new Date());

    const res = await this.db.messageChunk.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });
    console.warn(`Successfully hard deleted ${res.count} messageChunks.`);
  }
}
