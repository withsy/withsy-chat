import { ChatSelect } from "@/types/chat";
import type { ChatBranchList, ChatBranchStart } from "@/types/chat-branch";
import type { MessageId } from "@/types/message";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";
import { ChatService } from "./chat-service";
import type { Tx } from "./db";
import { IdempotencyInfoService } from "./idempotency-info-service";
import { MessageService } from "./message-service";

export class ChatBranchService {
  constructor(private readonly service: ServiceRegistry) {}

  async list(userId: UserId, input: ChatBranchList) {
    const { chatId } = input;
    const xs = await this.service.db.chat.findMany({
      where: {
        parentMessage: {
          chatId,
        },
        userId,
        deletedAt: null,
      },
      select: ChatSelect,
    });
    return xs;
  }

  async start(userId: UserId, input: ChatBranchStart) {
    const { idempotencyKey, messageId } = input;
    const res = await this.service.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);

      const parentMessage = await MessageService.get(tx, {
        userId,
        messageId,
      });

      const title = parentMessage.text
        ? [...parentMessage.text].slice(0, 20).join("")
        : undefined;

      const chat = await ChatBranchService.create(tx, {
        userId,
        parentMessageId: parentMessage.id,
        title,
      });

      return chat;
    });

    return res;
  }

  static async create(
    tx: Tx,
    input: { userId: UserId; parentMessageId: MessageId; title?: string }
  ) {
    const { userId, parentMessageId, title } = input;
    const res = await tx.chat.create({
      data: {
        id: ChatService.generateId(),
        userId,
        title,
        type: "branch",
        parentMessageId,
      },
      select: ChatSelect,
    });

    return res;
  }
}
