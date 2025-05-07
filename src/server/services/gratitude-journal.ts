import { ChatSelect, ChatStartOutput, type ChatEntity } from "@/types/chat";
import {
  GratitudeJournalData,
  GratitudeJournalEntity,
  GratitudeJournalGetJournal,
  GratitudeJournalRecentJournal,
  GratitudeJournalSelect,
  GratitudeJournalStartChat,
  GratitudeJournalStats,
} from "@/types/gratitude-journal";
import type { UserId } from "@/types/id";
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
import { v7 as uuidv7 } from "uuid";
import type { ServiceRegistry } from "../service-registry";
import { ChatService } from "./chat";
import { ChatPromptService } from "./chat-prompt";
import type { Tx } from "./db";
import { IdempotencyInfoService } from "./idempotency-info";
import { MessageService } from "./message";
import { UserService } from "./user";

export class GratitudeJournalService {
  constructor(private readonly service: ServiceRegistry) {}

  decrypt(
    entity: GratitudeJournalEntity & { chat?: ChatEntity | null }
  ): GratitudeJournalData {
    const data = {
      id: entity.id,
      chatId: entity.chatId,
      chat: entity.chat ? this.service.chat.decrypt(entity.chat) : null,
    } satisfies GratitudeJournalData;
    return data;
  }

  async getStats(userId: UserId): Promise<GratitudeJournalStats> {
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
    const entity = await this.service.db.gratitudeJournal.findUniqueOrThrow({
      where: { userId, id: gratitudeJournalId },
      select: {
        ...GratitudeJournalSelect,
        chat: { select: ChatSelect },
      },
    });

    const data = this.decrypt(entity);
    return data;
  }

  async startChat(
    userId: UserId,
    input: GratitudeJournalStartChat
  ): Promise<ChatStartOutput> {
    const { idempotencyKey } = input;

    const user = await this.service.user.getForGratitudeJournal({ userId });
    const userName = this.service.encryption.decrypt(user.nameEncrypted);

    const now = new Date();
    const prepareRes = await this.service.db.$transaction(async (tx) => {
      const timezoneInfo = await GratitudeJournalService.getTimezoneInfo(tx, {
        userId,
        now,
      });

      const promptText = GratitudeJournalService.createPromptText({
        userName,
        userAiLanguage: user.aiLanguage,
        zonedDate: zonedTodayDate,
      });

      return { timezoneInfo, promptText };
    });

    const { timezoneInfo, promptText } = prepareRes;
    const { utcTodayStart, utcTodayEnd, zonedTodayDate } = timezoneInfo;

    const title = `Gratitude Journal - ${zonedTodayDate}`;
    const titleEncrypted = this.service.encryption.encrypt(title);
    const promptTextEncrypted = this.service.encryption.encrypt(promptText);
    const userMessageTextEncrypted = this.service.encryption.encrypt("");
    const userMessageReasoningTextEncrypted =
      this.service.encryption.encrypt("");
    const modelMessageTextEncrypted = this.service.encryption.encrypt("");
    const modelMessageReasoningTextEncrypted =
      this.service.encryption.encrypt("");

    const createRes = await this.service.db.$transaction(async (tx) => {
      await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);

      const where = GratitudeJournalService.getTodayJournalWhere({
        userId,
        utcTodayStart,
        utcTodayEnd,
      });
      const todayJournal = await tx.gratitudeJournal.findFirst({
        where,
        select: GratitudeJournalSelect,
      });
      if (todayJournal) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Today's Gratitude Journal already exists.",
        });
      }

      const chat = await ChatService.createGratitudeJournalChat(tx, {
        userId,
        titleEncrypted,
      });

      const prompt = await ChatPromptService.create(tx, {
        chatId: chat.id,
        textEncrypted: promptTextEncrypted,
      });
      chat.prompts.push(prompt);

      const userMessage = await MessageService.createUserMessage(tx, {
        chatId: chat.id,
        textEncrypted: userMessageTextEncrypted,
        reasoningTextEncrypted: userMessageReasoningTextEncrypted,
        isPublic: false,
      });
      const modelMessage = await MessageService.createModelMessage(tx, {
        chatId: chat.id,
        model: "gemini-2.0-flash",
        parentMessageId: userMessage.id,
        textEncrypted: modelMessageTextEncrypted,
        reasoningTextEncrypted: modelMessageReasoningTextEncrypted,
      });

      const gratitudeJournal = await tx.gratitudeJournal.create({
        data: {
          id: GratitudeJournalService.generateId(),
          userId,
          chatId: chat.id,
        },
        select: GratitudeJournalSelect,
      });
      chat.gratitudeJournals.push(gratitudeJournal);

      return { chat, userMessage, modelMessage };
    });

    const { chat, userMessage, modelMessage } = createRes;

    await this.service.task.add("model_route_send_message_to_ai", {
      userId,
      userMessageId: userMessage.id,
      modelMessageId: modelMessage.id,
    });

    return {
      chat: this.service.chat.decrypt(chat),
      userMessage: this.service.message.decrypt(userMessage),
      modelMessage: this.service.message.decrypt(modelMessage),
    };
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
