import { MessageSelect } from "@/types/message";
import type { ReplyRegenerate } from "@/types/reply";
import { Role } from "@/types/role";
import type { UserId } from "@/types/user";
import { StatusCodes } from "http-status-codes";
import { HttpServerError } from "../error";
import type { ServiceRegistry } from "../service-registry";
import { IdempotencyInfoService } from "./idempotency-info-service";
import { MessageService } from "./message-service";

export class ReplyService {
  constructor(private readonly service: ServiceRegistry) {}

  async regenerate(userId: UserId, input: ReplyRegenerate) {
    const { idempotencyKey, messageId, model } = input;
    const { userMessage, modelMessage } = await this.service.db.$transaction(
      async (tx) => {
        await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);

        const oldModelMessage = await tx.message.findUniqueOrThrow({
          where: {
            chat: {
              userId,
              deletedAt: null,
            },
            id: messageId,
          },
          select: MessageSelect,
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
            chat: {
              userId,
              deletedAt: null,
            },
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
          },
          select: MessageSelect,
        });

        return { userMessage, modelMessage };
      }
    );

    await this.service.task.add("model_route_send_message_to_ai", {
      userId,
      userMessageId: userMessage.id,
      modelMessageId: modelMessage.id,
    });

    return modelMessage;
  }
}
