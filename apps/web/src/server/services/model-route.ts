import type { MaybePromise } from "@/types/common";
import type { MessageData, MessageDataForAi, MessageId } from "@/types/message";
import type { MessageChunkIndex } from "@/types/message-chunk";
import { Model, ModelProviderMap } from "@/types/model";
import { Role } from "@/types/role";
import type { UserId } from "@/types/user";
import { UserDefaultPromptGetOutput } from "@/types/user-default-prompt";
import { match } from "ts-pattern";
import type { Simplify } from "type-fest";
import type { EncryptionService } from "../encryption/encryption.service";
import type { MessageChunkService } from "../message-chunk/message-chunk.service";
import { MessageService } from "../message/message.service";
import type { ChatMessageDecryptService } from "./chat-message-decrypt";
import type { Db } from "./db";
import type { GoogleGenAiService } from "./google-gen-ai";
import type { UserDefaultPromptService } from "./user-default-prompt";
import { UserUsageLimitService } from "./user-usage-limit";
import type { XAiService } from "./x-ai";

export type ValidatedModelMessage = Simplify<
  Omit<MessageData, "model"> & {
    model: NonNullable<MessageData["model"]>;
  }
>;

export type SendMessageToAiInput = {
  model: Model;
  promptText: string;
  messagesForAi: MessageDataForAi[];
  onMessageChunkReceived: OnMessageChunkReceived;
};

export type OnMessageChunkReceivedInput = {
  text: string;
  reasoningText: string;
  rawData: string;
};
export type OnMessageChunkReceived = (
  input: OnMessageChunkReceivedInput
) => MaybePromise<void>;

export class ModelRouteService {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageChunkService: MessageChunkService,
    private readonly googleGenAiService: GoogleGenAiService,
    private readonly xAiService: XAiService,
    private readonly db: Db,
    private readonly encryptionService: EncryptionService,
    private readonly userDefaultPromptService: UserDefaultPromptService,
    private readonly chatMessageDecryptService: ChatMessageDecryptService
  ) {}

  async sendMessageToAi(input: {
    userId: UserId;
    userMessageId: MessageId;
    modelMessageId: MessageId;
  }) {
    const { userId, userMessageId, modelMessageId } = input;
    const chatMessage = await this.messageService.transitPendingToProcessing({
      userId,
      messageId: modelMessageId,
    });
    if (!chatMessage) return;

    const parseRes = await this.parseInput({
      userId,
      userMessageId,
      modelMessageId,
    });
    if (!parseRes.ok) return;

    const { modelMessage, userDefaultPrompt } = parseRes;
    const userDefaultPromptText = userDefaultPrompt?.userPrompt?.text ?? "";
    const userPromptText = modelMessage.chat?.userPrompt?.text ?? "";
    const chatPromptText = modelMessage.chat?.prompts?.at(0)?.text ?? "";
    const promptText = [userDefaultPromptText, userPromptText, chatPromptText]
      .filter((x) => x.length > 0)
      .join("\n");

    const messagesForAi = await this.messagesForAi({
      userId,
      modelMessage,
    });

    let index: MessageChunkIndex = 0;

    const createChunk = async (input: {
      text: string;
      reasoningText: string;
      rawData: string;
      isDone: boolean;
    }) => {
      const { text, reasoningText, rawData, isDone } = input;
      await this.messageChunkService.create({
        messageId: modelMessage.id,
        index,
        text,
        reasoningText,
        rawData,
        isDone,
      });
      index += 1;
    };

    let isSuccess = false;
    try {
      const modelProviderKey = ModelProviderMap[modelMessage.model];

      const onMessageChunkReceived: OnMessageChunkReceived = async (input) => {
        const { rawData, text, reasoningText } = input;
        await createChunk({ text, reasoningText, rawData, isDone: false });
      };

      const input: SendMessageToAiInput = {
        model: modelMessage.model,
        promptText,
        messagesForAi,
        onMessageChunkReceived,
      };
      await match(modelProviderKey)
        .with(
          "google-gen-ai",
          async () => await this.googleGenAiService.sendMessageToAi(input)
        )
        .with("x-ai", async () => await this.xAiService.sendMessageToAi(input))
        .exhaustive();

      isSuccess = true;
    } catch (e) {
      console.error("Send chat to ai failed. error:", e);
    } finally {
      await createChunk({
        text: "",
        reasoningText: "",
        rawData: "",
        isDone: true,
      });

      if (isSuccess) {
        await this.messageService.transitProcessingToSucceeded({
          userId,
          messageId: modelMessageId,
        });
      } else {
        await this.db.$transaction(async (tx) => {
          await MessageService.tryTransitProcessingToFailed(tx, {
            userId,
            messageId: modelMessageId,
          });
          await UserUsageLimitService.compensateMessage(tx, { userId });
        });
      }
    }
  }

  private async messagesForAi(input: {
    userId: UserId;
    modelMessage: MessageData;
  }): Promise<MessageDataForAi[]> {
    const { userId, modelMessage } = input;
    const entities = await this.messageService.listForAi({
      userId,
      modelMessage,
    });

    while (true) {
      const x = entities.at(0);
      if (!x) break;
      if (x.role === Role.enum.user) break;
      entities.shift();
    }

    const datas = entities.map((x) => ({
      role: x.role,
      text: this.encryptionService.decrypt(x.textEncrypted),
    }));
    return datas;
  }

  private async parseInput(input: {
    userId: UserId;
    userMessageId: MessageId;
    modelMessageId: MessageId;
  }): Promise<
    | {
        ok: true;
        userMessage: MessageData;
        modelMessage: ValidatedModelMessage;
        userDefaultPrompt: UserDefaultPromptGetOutput;
      }
    | { ok: false }
  > {
    const { userId, userMessageId, modelMessageId } = input;

    const [userMessageRaw, modelMessageRaw, userDefaultPromptRaw] =
      await Promise.all([
        this.messageService.getForAi({ userId, messageId: userMessageId }),
        this.messageService.getForAi({
          userId,
          messageId: modelMessageId,
          include: { chat: true },
        }),
        this.userDefaultPromptService.get(userId),
      ]);

    const userMessage =
      this.chatMessageDecryptService.decryptMessage(userMessageRaw);
    const modelMessage =
      this.chatMessageDecryptService.decryptMessage(modelMessageRaw);
    const userDefaultPrompt =
      UserDefaultPromptGetOutput.parse(userDefaultPromptRaw);
    if (modelMessage.model == null) {
      console.error(
        "Model message model must not be null. modelMessageId:",
        modelMessage.id
      );
      return { ok: false };
    }

    if (userMessage.chatId !== modelMessage.chatId) {
      console.error("Chat id is mismatched.");
      return { ok: false };
    }

    return {
      ok: true,
      userMessage,
      modelMessage: {
        ...modelMessage,
        model: modelMessage.model,
      },
      userDefaultPrompt,
    };
  }
}
