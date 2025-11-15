import type { UserId } from "@/types/id";
import type { MessageSend, MessageSendOutput } from "@/types/message";
import type { Db } from "./db";
import { IdempotencyInfoService } from "./idempotency-info";
import { UserUsageLimitService } from "./user-usage-limit";
import type { EncryptionService } from "./encryption";
import { MessageService } from "./message";
import type { ChatMessageDecryptService } from "./chat-message-decrypt";
import type { ModelRouteService } from "./model-route";

export class MessageSender {
  constructor(
    private readonly db: Db,
    private readonly encryptionService: EncryptionService,
    private readonly chatMessageDecryptService: ChatMessageDecryptService,
    private readonly modelRouteService: ModelRouteService
  ) {}

  async send(userId: UserId, input: MessageSend): Promise<MessageSendOutput> {
    const { idempotencyKey, chatId, model, text } = input;

    await this.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);
      await UserUsageLimitService.checkMessage(tx, { userId });
    });

    const userMessageTextEncrypted = this.encryptionService.encrypt(text);
    const userMessageReasoningTextEncrypted =
      this.encryptionService.encrypt("");
    const modelMessageTextEncrypted = this.encryptionService.encrypt("");
    const modelMessageReasoningTextEncrypted =
      this.encryptionService.encrypt("");

    const { userMessage, modelMessage } = await this.db.$transaction(
      async (tx) => {
        const userMessage = await MessageService.createUserMessage(tx, {
          chatId,
          textEncrypted: userMessageTextEncrypted,
          isPublic: true,
          reasoningTextEncrypted: userMessageReasoningTextEncrypted,
        });

        const modelMessage = await MessageService.createModelMessage(tx, {
          chatId,
          model,
          parentMessageId: userMessage.id,
          textEncrypted: modelMessageTextEncrypted,
          reasoningTextEncrypted: modelMessageReasoningTextEncrypted,
        });

        return { userMessage, modelMessage };
      }
    );

    this.modelRouteService.onSendMessageToAiTask({
      userId,
      userMessageId: userMessage.id,
      modelMessageId: modelMessage.id,
    });

    await UserUsageLimitService.decreaseMessage(this.db, { userId });

    return {
      userMessage: this.chatMessageDecryptService.decryptMessage(userMessage),
      modelMessage: this.chatMessageDecryptService.decryptMessage(modelMessage),
    };
  }
}
