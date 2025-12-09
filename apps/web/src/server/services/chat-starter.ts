import type { ChatStart, ChatStartOutput } from "@/types/chat";
import type { UserId } from "@/types/user";
import { ChatService } from "../chat/chat.service";
import type { EncryptionService } from "../encryption/encryption.service";
import { MessageService } from "../message/message.service";
import type { ChatMessageDecryptService } from "./chat-message-decrypt";
import type { Db } from "./db";
import { IdempotencyInfoService } from "./idempotency-info";
import type { ModelRouteService } from "./model-route";
import { UserUsageLimitService } from "./user-usage-limit";

export class ChatStarter {
  constructor(
    private readonly db: Db,
    private readonly encryptionService: EncryptionService,
    private readonly chatMessageDecryptService: ChatMessageDecryptService,
    private readonly modelRouteService: ModelRouteService
  ) {}

  async start(userId: UserId, input: ChatStart): Promise<ChatStartOutput> {
    const { model, text, idempotencyKey } = input;

    await this.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);
      await UserUsageLimitService.checkMessage(tx, { userId });
    });

    const modelMessageTextEncrypted = this.encryptionService.encrypt("");
    const modelMessageReasoningTextEncrypted =
      this.encryptionService.encrypt("");
    const userMessageTextEncrypted = this.encryptionService.encrypt(text);
    const userMessageReasoningTextEncrypted =
      this.encryptionService.encrypt("");
    const title = [...text].slice(0, 20).join("");
    const titleEncrypted = this.encryptionService.encrypt(title);

    const { chat, userMessage, modelMessage } = await this.db.$transaction(
      async (tx) => {
        const chat = await ChatService.createChat(tx, {
          userId,
          titleEncrypted,
        });

        const userMessage = await MessageService.createUserMessage(tx, {
          chatId: chat.id,
          textEncrypted: userMessageTextEncrypted,
          reasoningTextEncrypted: userMessageReasoningTextEncrypted,
          isPublic: true,
        });

        const modelMessage = await MessageService.createModelMessage(tx, {
          chatId: chat.id,
          model,
          parentMessageId: userMessage.id,
          textEncrypted: modelMessageTextEncrypted,
          reasoningTextEncrypted: modelMessageReasoningTextEncrypted,
        });

        return { chat, userMessage, modelMessage };
      }
    );

    this.modelRouteService
      .sendMessageToAi({
        userId,
        userMessageId: userMessage.id,
        modelMessageId: modelMessage.id,
      })
      .catch((e) => {
        console.error("Failed to start chat.", e);
      });

    await UserUsageLimitService.decreaseMessage(this.db, { userId });

    const res = {
      chat: this.chatMessageDecryptService.decryptChat(chat),
      userMessage: this.chatMessageDecryptService.decryptMessage(userMessage),
      modelMessage: this.chatMessageDecryptService.decryptMessage(modelMessage),
    } satisfies ChatStartOutput;

    return res;
  }
}
