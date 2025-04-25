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
import { PromptService } from "./prompt";
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

    const { chat, userMessage, modelMessage } =
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

        const zonedDate = format(zonedNow, "yyyy-MM-dd");
        const title = `Gratitude Journal - ${zonedDate}`;
        const chat = await ChatService.createGratitudeJournalChat(tx, {
          userId,
          title,
        });

        const user = await UserService.getForGratitudeJournal(tx, { userId });
        const promptText = GratitudeJournalService.createPromptText({
          userName: user.name,
          userLanguage: user.language,
          zonedDate,
        });
        const prompt = await PromptService.create(tx, {
          chatId: chat.id,
          text: promptText,
        });
        chat.prompts.push(prompt);

        const userMessage = await MessageService.createUserMessage(tx, {
          chatId: chat.id,
          text: "",
          isPublic: false,
        });
        const modelMessage = await MessageService.createModelMessage(tx, {
          chatId: chat.id,
          model: "gemini-2.0-flash",
          parentMessageId: userMessage.id,
        });

        const gratitudeJournal = await tx.gratitudeJournal.create({
          data: {
            userId,
            chatId: chat.id,
          },
          select: GratitudeJournalSelect,
        });
        chat.gratitudeJournals.push(gratitudeJournal);

        return { chat, userMessage, modelMessage };
      });

    await this.service.task.add("model_route_send_message_to_ai", {
      userId,
      userMessageId: userMessage.id,
      modelMessageId: modelMessage.id,
    });

    return { chat, userMessage, modelMessage };
  }

  static createPromptText(input: {
    userName: string;
    userLanguage: string;
    zonedDate: string;
  }) {
    const { userName, userLanguage, zonedDate } = input;
    return `You will answer all questions in ${userLanguage}.
The user's name is ${userName}.
You are my friend Milo, and we write a gratitude journal together every day.
**As Milo, please start by greeting the user warmly.**
You are here to listen to my thoughts and experiences.
When I share three things I am grateful for today, our conversation for the day will conclude.
Your name is Milo, and from now on, the user will refer to you as Milo.`;
  }
}
