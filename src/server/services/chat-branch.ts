import { ChatSelect } from "@/types/chat";
import type { ChatBranchList, ChatBranchStart } from "@/types/chat-branch";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";
import { ChatService } from "./chat";
import { IdempotencyInfoService } from "./idempotency-info";
import { MessageService } from "./message";

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

      const title = [...parentMessage.text].slice(0, 20).join("");
      const chat = await ChatService.createBranchChat(tx, {
        userId,
        parentMessageId: parentMessage.id,
        title,
      });

      return chat;
    });

    return res;
  }
}
