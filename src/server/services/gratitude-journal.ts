import { ChatSelect, type ChatEntity } from "@/types/chat";
import {
  GratitudeJournalData,
  GratitudeJournalEntity,
  GratitudeJournalGetJournal,
  GratitudeJournalRecentJournal,
  GratitudeJournalSelect,
  GratitudeJournalStats,
} from "@/types/gratitude-journal";
import type { UserId } from "@/types/id";
import type { Prisma } from "@prisma/client";
import {
  endOfDay,
  format,
  isSameDay,
  startOfDay,
  subDays,
  subMonths,
} from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { v7 as uuidv7 } from "uuid";
import type { Db, Tx } from "./db";
import { UserService } from "./user";
import type { ChatMessageDecryptService } from "./chat-message-decrypt";

export class GratitudeJournalService {
  constructor(
    private readonly db: Db,
    private readonly chatMessageDecryptService: ChatMessageDecryptService
  ) {}

  decrypt(
    entity: GratitudeJournalEntity & { chat?: ChatEntity | null }
  ): GratitudeJournalData {
    const data = {
      id: entity.id,
      chatId: entity.chatId,
      chat: entity.chat
        ? this.chatMessageDecryptService.decryptChat(entity.chat)
        : null,
    } satisfies GratitudeJournalData;
    return data;
  }

  async getStats(userId: UserId): Promise<GratitudeJournalStats> {
    const res = await this.db.$transaction(async (tx) => {
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
        select: { ...GratitudeJournalSelect, chat: { select: ChatSelect } },
      });

      let currentStreak = todayJournal ? 1 : 0;
      let zonedCheckStart = subDays(zonedTodayStart, 1);
      let isCurrentStreakDone = false;
      const recentJournals: GratitudeJournalRecentJournal[] = new Array(
        xs.length
      );
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

    const todayJournal = res.todayJournal
      ? this.decrypt(res.todayJournal)
      : null;
    return {
      recentJournals: res.recentJournals,
      currentStreak: res.currentStreak,
      todayJournal,
    };
  }

  async getJournal(
    userId: UserId,
    input: GratitudeJournalGetJournal
  ): Promise<GratitudeJournalData> {
    const { gratitudeJournalId } = input;
    const entity = await this.db.gratitudeJournal.findUniqueOrThrow({
      where: { userId, id: gratitudeJournalId },
      select: {
        ...GratitudeJournalSelect,
        chat: { select: ChatSelect },
      },
    });

    const data = this.decrypt(entity);
    return data;
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
