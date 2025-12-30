import { ChatMessageId } from "../chat-message/chat-message-schemas.js";
import { AiSendTextOutput } from "../common-schemas.js";
import { Tx } from "../db/db-service.js";
import { E8nService } from "../e8n/e8n-service.js";

export class ChatChunkE8nRepo {
  constructor(
    private readonly tx: Tx,
    private readonly e8nService: E8nService,
  ) {}

  async create(
    input: {
      chatMessageId: ChatMessageId;
      isDone: boolean;
      index: number;
    } & AiSendTextOutput,
  ): Promise<void> {
    const { chatMessageId, isDone, index, text, reasoningText, rawData } =
      input;

    await this.tx.chatChunk.create({
      data: {
        chatMessageId,
        index,
        isDone,
        textEncrypted: this.e8nService.encrypt(text),
        reasoningTextEncrypted: this.e8nService.encrypt(reasoningText),
        rawDataEncrypted: this.e8nService.encrypt(rawData),
      },
    });
  }
}
