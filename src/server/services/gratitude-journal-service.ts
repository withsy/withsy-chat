import { ChatSelect } from "@/types/chat";
import {
  GratitudeJournalSelect,
  type GratitudeJournalList,
  type GratitudeJournalStart,
} from "@/types/gratitude-journal";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";
import { ChatService } from "./chat-service";
import { IdempotencyInfoService } from "./idempotency-info-service";

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
    const res = await this.service.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);

      const chat = await tx.chat.create({
        data: {
          id: ChatService.generateId(),
          userId,
          type: "chat",
          title: "Gratitude Journal",
        },
        select: ChatSelect,
      });

      const gratitudeJournal = await tx.gratitudeJournal.create({
        data: {
          userId,
          chatId: chat.id,
        },
        select: GratitudeJournalSelect,
      });
    });
  }
}
