import type { UserId } from "@/types/id";
import * as Message from "@/types/message";
import type * as MessageReply from "@/types/message-reply";
import { Role } from "@/types/role";
import { StatusCodes } from "http-status-codes";
import { HttpServerError } from "../error";
import type { ServiceRegistry } from "../service-registry";
import { IdempotencyInfoService } from "./idempotency-info";
import { MessageService } from "./message";
import { UserUsageLimitService } from "./user-usage-limit";

export class MessageReplyService {
  constructor(private readonly service: ServiceRegistry) {}

  async regenerate(
    userId: UserId,
    input: MessageReply.Regenerate
  ): Promise<Message.Data> {
    const { idempotencyKey, messageId, model } = input;

    const modelMessageTextEncrypted = this.service.encryption.encrypt("");
    const modelMessageReasoningTextEncrypted =
      this.service.encryption.encrypt("");

    const { userMessage, modelMessage } = await this.service.db.$transaction(
      async (tx) => {
        await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);
        await UserUsageLimitService.checkMessage(tx, { userId });
        const oldModelMessage = await tx.message.findUniqueOrThrow({
          where: {
            chat: { userId, deletedAt: null },
            id: messageId,
          },
          select: Message.Select,
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
          select: Message.Select,
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
          select: Message.Select,
        });

        return { userMessage, modelMessage };
      }
    );

    await this.service.task.add("model_route_send_message_to_ai", {
      userId,
      userMessageId: userMessage.id,
      modelMessageId: modelMessage.id,
    });

    await UserUsageLimitService.decreaseMessage(this.service.db, { userId });

    const data = this.service.message.decrypt(modelMessage);
    return data;
  }
}
