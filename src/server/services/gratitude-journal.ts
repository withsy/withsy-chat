import {
  GratitudeJournalSelect,
  type GratitudeJournalList,
  type GratitudeJournalStart,
} from "@/types/gratitude-journal";
import type { UserId } from "@/types/user";
import { TRPCError } from "@trpc/server";
import { endOfDay, format, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type { ServiceRegistry } from "../service-registry";
import { ChatService } from "./chat";
import { IdempotencyInfoService } from "./idempotency-info";
import { MessageService } from "./message";
import { UserService } from "./user";

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

        const timezone = await UserService.getTimezone(tx, { userId });
        const utcNow = new Date();
        const zonedNow = toZonedTime(utcNow, timezone);
        const zonedTodayStart = startOfDay(zonedNow);
        const zonedTodayEnd = endOfDay(zonedNow);
        const utcTodayStart = fromZonedTime(zonedTodayStart, timezone);
        const utcTodayEnd = fromZonedTime(zonedTodayEnd, timezone);

        const existingJournal = await tx.gratitudeJournal.findFirst({
          where: {
            userId,
            createdAt: {
              gte: utcTodayStart,
              lte: utcTodayEnd,
            },
          },
        });

        if (existingJournal) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Today's Gratitude Journal already exists.",
          });
        }

        const title = `Gratitude Journal - ${format(zonedNow, "yyyy-MM-dd")}`;
        const chat = await ChatService.createChat(tx, {
          userId,
          title,
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
