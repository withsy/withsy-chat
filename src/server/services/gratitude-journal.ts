import { GratitudeJournal } from "@/types";
import { ChatSelect } from "@/types/chat";
import { RecentJournal } from "@/types/gratitude-journal";
import type { UserId } from "@/types/user";
import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  endOfDay,
  format,
  isSameDay,
  startOfDay,
  subDays,
  subMonths,
} from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { uuidv7 } from "uuidv7";
import type { ServiceRegistry } from "../service-registry";
import { ChatService } from "./chat";
import type { Tx } from "./db";
import { IdempotencyInfoService } from "./idempotency-info";
import { MessageService } from "./message";
import { PromptService } from "./prompt";
import { UserService } from "./user";

export class GratitudeJournalService {
  constructor(private readonly service: ServiceRegistry) {}

  async getStats(userId: UserId) {
    const res = await this.service.db.$transaction(async (tx) => {
      const now = new Date();
      const { timezone, zonedTodayStart, utcTodayStart, utcTodayEnd } =
        await GratitudeJournalService.getTimezoneInfo(tx, {
          userId,
          now,
        });

      const zonedOldStart = subMonths(zonedTodayStart, 3);
      const utcOldStart = fromZonedTime(zonedOldStart, timezone);

      const xs = await tx.gratitudeJournal.findMany({
        where: {
          userId,
          createdAt: {
            gte: utcOldStart,
            lte: utcTodayEnd,
          },
        },
        select: {
          id: true,
          createdAt: true,
        },
        orderBy: {
          id: "asc",
        },
      });

      const todayJournal = await tx.gratitudeJournal.findFirst({
        where: GratitudeJournalService.getTodayJournalWhere({
          userId,
          utcTodayStart,
          utcTodayEnd,
        }),
        select: { ...GratitudeJournal.Select, chat: { select: ChatSelect } },
      });

      let currentStreak = todayJournal ? 1 : 0;
      let zonedCheckStart = subDays(zonedTodayStart, 1);
      let isCurrentStreakDone = false;
      const recentJournals: RecentJournal[] = new Array(xs.length);
      for (let i = xs.length - 1; i >= 0; --i) {
        const x = xs[i];
        const zonedTime = toZonedTime(x.createdAt, timezone);

        if (!isCurrentStreakDone && isSameDay(zonedTime, zonedCheckStart)) {
          currentStreak += 1;
          zonedCheckStart = subDays(zonedCheckStart, 1);
        } else {
          isCurrentStreakDone = true;
        }

        const zonedDate = GratitudeJournalService.formatDate(zonedTime);
        recentJournals[i] = {
          zonedDate,
          gratitudeJournalId: x.id,
        };
      }

      return {
        recentJournals,
        currentStreak,
        todayJournal,
      };
    });

    return res;
  }

  async getJournal(userId: UserId, input: GratitudeJournal.GetJournal) {
    const { gratitudeJournalId } = input;
    const res = await this.service.db.gratitudeJournal.findUniqueOrThrow({
      where: {
        userId,
        id: gratitudeJournalId,
      },
      select: {
        ...GratitudeJournal.Select,
        chat: {
          select: ChatSelect,
        },
      },
    });

    return res;
  }

  async startChat(userId: UserId, input: GratitudeJournal.StartChat) {
    const { idempotencyKey } = input;

    const { chat, userMessage, modelMessage } =
      await this.service.db.$transaction(async (tx) => {
        await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);

        const now = new Date();
        const { utcTodayStart, utcTodayEnd, zonedTodayDate } =
          await GratitudeJournalService.getTimezoneInfo(tx, {
            userId,
            now,
          });

        const where = GratitudeJournalService.getTodayJournalWhere({
          userId,
          utcTodayStart,
          utcTodayEnd,
        });
        const todayJournal = await tx.gratitudeJournal.findFirst({
          where,
          select: GratitudeJournal.Select,
        });
        if (todayJournal) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Today's Gratitude Journal already exists.",
          });
        }

        const title = `Gratitude Journal - ${zonedTodayDate}`;
        const chat = await ChatService.createGratitudeJournalChat(tx, {
          userId,
          title,
        });

        const user = await UserService.getForGratitudeJournal(tx, { userId });
        const promptText = GratitudeJournalService.createPromptText({
          userName: user.name,
          userAiLanguage: user.aiLanguage,
          zonedDate: zonedTodayDate,
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
            id: GratitudeJournalService.generateId(),
            userId,
            chatId: chat.id,
          },
          select: GratitudeJournal.Select,
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

  static generateId() {
    return uuidv7();
  }

  static createPromptText(input: {
    userName: string;
    userAiLanguage: string;
    zonedDate: string;
  }) {
    const { userName, userAiLanguage, zonedDate } = input;
    return `You will answer all questions in ${userAiLanguage}.
The user's name is ${userName}.
Today's date is ${zonedDate}.
You are the user's friend named Milo, and you write a gratitude journal together every day.
**As Milo, please start by greeting ${userName} warmly and mentioning today's date (${zonedDate}).**
You are here to listen to ${userName}'s thoughts and experiences.
When ${userName} shares three things they are grateful for today, the conversation for the day will conclude.
Your name is Milo, and you should always respond as Milo in a friendly, supportive manner.
Help ${userName} reflect on positive experiences and express gratitude.`;
  }

  static async getTimezoneInfo(tx: Tx, input: { userId: UserId; now: Date }) {
    const { userId, now } = input;
    const timezone = await UserService.getTimezone(tx, { userId });
    const zonedNow = toZonedTime(now, timezone);
    const zonedTodayDate = GratitudeJournalService.formatDate(zonedNow);
    const zonedTodayStart = startOfDay(zonedNow);
    const zonedTodayEnd = endOfDay(zonedNow);
    const utcTodayStart = fromZonedTime(zonedTodayStart, timezone);
    const utcTodayEnd = fromZonedTime(zonedTodayEnd, timezone);
    return {
      timezone,
      zonedNow,
      zonedTodayDate,
      zonedTodayStart,
      zonedTodayEnd,
      utcTodayStart,
      utcTodayEnd,
    };
  }

  static getTodayJournalWhere(input: {
    userId: UserId;
    utcTodayStart: Date;
    utcTodayEnd: Date;
  }) {
    const { userId, utcTodayStart, utcTodayEnd } = input;
    return {
      userId,
      createdAt: {
        gte: utcTodayStart,
        lte: utcTodayEnd,
      },
    } satisfies Prisma.GratitudeJournalWhereInput;
  }

  static formatDate(date: Date) {
    return format(date, "yyyy-MM-dd");
  }
}
