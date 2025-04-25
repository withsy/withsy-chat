import { ChatSelect } from "@/types/chat";
import { ChatPromptSelect } from "@/types/chat-prompt";
import {
  PromptCreate,
  PromptMetaSelect,
  PromptSelect,
  PromptStart,
  type PromptGet,
  type PromptList,
  type PromptUpdate,
} from "@/types/prompt";
import type { UserId } from "@/types/user";
import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";
import type { ServiceRegistry } from "../service-registry";
import { ChatService } from "./chat-service";
import { IdempotencyInfoService } from "./idempotency-info-service";
import { MessageService } from "./message-service";

export class PromptService {
  constructor(private readonly service: ServiceRegistry) {}

  async create(userId: UserId, input: PromptCreate) {
    const { title, text } = input;
    const res = await this.service.db.prompt.create({
      data: {
        id: PromptService.generateId(),
        userId,
        title,
        text,
      },
      select: PromptSelect,
    });

    return res;
  }

  async get(userId: UserId, input: PromptGet) {
    const { promptId } = input;
    const res = await this.service.db.prompt.findUniqueOrThrow({
      where: {
        userId,
        deletedAt: null,
        id: promptId,
      },
      select: PromptSelect,
    });

    return res;
  }

  async list(userId: UserId, _input: PromptList) {
    const xs = await this.service.db.prompt.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        id: "asc",
      },
      select: PromptMetaSelect,
    });

    return xs;
  }

  async update(userId: UserId, input: PromptUpdate) {
    const { promptId, title, text, isStarred } = input;
    const res = await this.service.db.prompt.update({
      where: {
        userId,
        deletedAt: null,
        id: promptId,
      },
      data: {
        title,
        text,
        isStarred,
      },
      select: PromptSelect,
    });

    return res;
  }

  async start(userId: UserId, input: PromptStart) {
    const { idempotencyKey, promptId } = input;

    const { chat, userMessage, modelMessage } =
      await this.service.db.$transaction(async (tx) => {
        await IdempotencyInfoService.checkDuplicateRequest(tx, idempotencyKey);

        const prompt = await tx.prompt.findUniqueOrThrow({
          where: {
            userId,
            deletedAt: null,
            id: promptId,
          },
          select: PromptSelect,
        });

        const chat = await ChatService.createPromptChat(tx, {
          userId,
          title: prompt.title,
        });

        const chatPrompt = await tx.chatPrompt.create({
          data: {
            chatId: chat.id,
            parentPromptId: prompt.id,
            text: prompt.text,
          },
          select: ChatPromptSelect,
        });
        chat.chatPrompts.push(chatPrompt);

        const userMessage = await MessageService.createUserMessage(tx, {
          chatId: chat.id,
          text: "Talk to me first.",
          isPublic: false,
        });

        const modelMessage = await MessageService.createModelMessage(tx, {
          chatId: chat.id,
          model: "gemini-1.5-pro",
          parentMessageId: userMessage.id,
        });

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
}
