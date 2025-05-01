import { Message, MessageReply } from "@/types";
import { Role } from "@/types/role";
import type { UserId } from "@/types/user";
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

    const { userMessage, modelMessage } = await this.service.db.$transaction(
      async (tx) => {
        await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);
        await UserUsageLimitService.lockAndCheck(tx, { userId });
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
              extra: {
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

    await UserUsageLimitService.lockAndDecrease(this.service.db, { userId });

    const data = this.service.message.decrypt(modelMessage);
    return data;
  }
}
