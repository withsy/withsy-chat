import {
  GratitudeJournalSelect,
  type GratitudeJournalList,
  type GratitudeJournalStart,
} from "@/types/gratitude-journal";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";
import { ChatService } from "./chat-service";
import { IdempotencyInfoService } from "./idempotency-info-service";
import { MessageService } from "./message-service";

export class GratitudeJournalService {
  constructor(private readonly service: ServiceRegistry) {}

  async list(userId: UserId, input: GratitudeJournalList) {
    const res = await this.service.db.gratitudeJournal.findMany({
      where: {
        userId,
      },
      select: GratitudeJournalSelect,
    });

    return res;
  }

  async start(userId: UserId, input: GratitudeJournalStart) {
    const { idempotencyKey } = input;

    const { chat, userMessage, modelMessage, gratitudeJournal } =
      await this.service.db.$transaction(async (tx) => {
        await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);

        const chat = await ChatService.createChat(tx, {
          userId,
          title: "Gratitude Journal",
        });

        const userMessage = await MessageService.createUserMessage(tx, {
          chatId: chat.id,
          text: "TODO: prompt",
          isPublic: false,
        });

        const modelMessage = await MessageService.createModelMessage(tx, {
          chatId: chat.id,
          model: "gemini-1.5-pro",
          parentMessageId: userMessage.id,
        });

        const gratitudeJournal = await tx.gratitudeJournal.create({
          data: {
            userId,
            chatId: chat.id,
          },
          select: GratitudeJournalSelect,
        });

        return { chat, userMessage, modelMessage, gratitudeJournal };
      });

    await this.service.task.add("model_route_send_message_to_ai", {
      userId,
      userMessageId: userMessage.id,
      modelMessageId: modelMessage.id,
    });

    return { chat, userMessage, modelMessage };
  }
}
