import type { UserId } from "@/types/id";
import { MessageSelect, type MessageData } from "@/types/message";
import type { MessageReplyRegenerate } from "@/types/message-reply";
import { Role } from "@/types/role";
import { StatusCodes } from "http-status-codes";
import { HttpServerError } from "../error";
import { IdempotencyInfoService } from "./idempotency-info";
import { MessageService } from "./message";
import { UserUsageLimitService } from "./user-usage-limit";
import { inject } from "../service-registry";

export class MessageReplyService {
  encryptionService = inject("encryptionService");
  db = inject("db");
  taskService = inject("taskService");
  messageService = inject("messageService");

  async regenerate(
    userId: UserId,
    input: MessageReplyRegenerate
  ): Promise<MessageData> {
    const { idempotencyKey, messageId, model } = input;

    const modelMessageTextEncrypted = this.encryptionService.encrypt("");
    const modelMessageReasoningTextEncrypted =
      this.encryptionService.encrypt("");

    const { userMessage, modelMessage } = await this.db.$transaction(
      async (tx) => {
        await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);
        await UserUsageLimitService.checkMessage(tx, { userId });
        const oldModelMessage = await tx.message.findUniqueOrThrow({
          where: {
            chat: { userId, deletedAt: null },
            id: messageId,
          },
          select: MessageSelect,
        });

        if (!oldModelMessage.parentMessageId) {
          throw new HttpServerError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "parentMessageId must exist.",
            {
              details: {
                messageId,
              },
            }
          );
        }

        const userMessage = await tx.message.findUniqueOrThrow({
          where: {
            chat: { userId, deletedAt: null },
            id: oldModelMessage.parentMessageId,
          },
          select: MessageSelect,
        });

        const modelMessage = await tx.message.create({
          data: {
            id: MessageService.generateId(),
            chatId: oldModelMessage.chatId,
            role: Role.enum.model,
            model: model ?? oldModelMessage.model,
            status: "pending",
            isPublic: true,
            textEncrypted: modelMessageTextEncrypted,
            reasoningTextEncrypted: modelMessageReasoningTextEncrypted,
            parentMessageId: oldModelMessage.parentMessageId,
          },
          select: MessageSelect,
        });

        return { userMessage, modelMessage };
      }
    );

    await this.taskService.add("model_route_send_message_to_ai", {
      userId,
      userMessageId: userMessage.id,
      modelMessageId: modelMessage.id,
    });

    await UserUsageLimitService.decreaseMessage(this.db, { userId });

    const data = this.messageService.decrypt(modelMessage);
    return data;
  }
}
