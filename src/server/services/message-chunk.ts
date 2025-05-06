import type { MessageChunkIndex, MessageId, UserId } from "@/types/id";
import * as MessageChunk from "@/types/message-chunk";
import type { ServiceRegistry } from "../service-registry";

export class MessageChunkService {
  constructor(private readonly service: ServiceRegistry) {}

  decrypt(entity: MessageChunk.Entity): MessageChunk.Data {
    const text = this.service.encryption.decrypt(entity.textEncrypted);
    const reasoningText = this.service.encryption.decrypt(
      entity.reasoningTextEncrypted
    );
    const data = {
      text,
      reasoningText,
      isDone: entity.isDone,
    } satisfies MessageChunk.Data;
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

    const textEncrypted = this.service.encryption.encrypt(text);
    const rawDataEncrypted = this.service.encryption.encrypt(rawData);
    const reasoningTextEncrypted =
      this.service.encryption.encrypt(reasoningText);

    await this.service.db.messageChunk.create({
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

    const entities = await this.service.db.messageChunk.findMany({
      where: {
        message: { chat: { userId, deletedAt: null } },
        messageId,
      },
      select: MessageChunk.Select,
      orderBy: { index: "asc" },
    });

    const datas = entities.map((x) => this.decrypt(x));
    const text = datas.map((x) => x.text).join("");
    const reasoningText = datas.map((x) => x.reasoningText).join("");
    return { text, reasoningText };
  }
}
