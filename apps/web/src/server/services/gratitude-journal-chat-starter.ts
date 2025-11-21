import type { ChatStartOutput } from "@/types/chat";
import {
  GratitudeJournalSelect,
  type GratitudeJournalStartChat,
} from "@/types/gratitude-journal";
import type { UserId } from "@/types/id";
import type { UserService } from "./user";
import type { EncryptionService } from "./encryption";
import type { Db } from "./db";
import { GratitudeJournalService } from "./gratitude-journal";
import { IdempotencyInfoService } from "./idempotency-info";
import { TRPCError } from "@trpc/server";
import { ChatService } from "./chat";
import { ChatPromptService } from "./chat-prompt";
import { MessageService } from "./message";
import type { ChatMessageDecryptService } from "./chat-message-decrypt";
import type { ModelRouteService } from "./model-route";

export class GratitudeJournalChatStarter {
  constructor(
    private readonly userService: UserService,
    private readonly encryptionService: EncryptionService,
    private readonly db: Db,
    private readonly chatMessageDecryptService: ChatMessageDecryptService,
    private readonly modelRouteService: ModelRouteService
  ) {}

  async start(
    userId: UserId,
    input: GratitudeJournalStartChat
  ): Promise<ChatStartOutput> {
    const { idempotencyKey } = input;

    const user = await this.userService.getForGratitudeJournal({ userId });
    const userName = this.encryptionService.decrypt(user.nameEncrypted);

    const now = new Date();
    const prepareRes = await this.db.$transaction(async (tx) => {
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
    const titleEncrypted = this.encryptionService.encrypt(title);
    const promptTextEncrypted = this.encryptionService.encrypt(promptText);
    const userMessageTextEncrypted = this.encryptionService.encrypt("");
    const userMessageReasoningTextEncrypted =
      this.encryptionService.encrypt("");
    const modelMessageTextEncrypted = this.encryptionService.encrypt("");
    const modelMessageReasoningTextEncrypted =
      this.encryptionService.encrypt("");

    const createRes = await this.db.$transaction(async (tx) => {
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

    this.modelRouteService
      .onSendMessageToAiTask({
        userId,
        userMessageId: userMessage.id,
        modelMessageId: modelMessage.id,
      })
      .catch((e) => {
        console.error("Failed to start gratitude journal chat.", e);
      });

    return {
      chat: this.chatMessageDecryptService.decryptChat(chat),
      userMessage: this.chatMessageDecryptService.decryptMessage(userMessage),
      modelMessage: this.chatMessageDecryptService.decryptMessage(modelMessage),
    };
  }
}
