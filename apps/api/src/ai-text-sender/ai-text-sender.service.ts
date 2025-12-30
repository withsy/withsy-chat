import { Injectable, Logger } from "@nestjs/common";
import { Model } from "@repo/common";
import { ChatChunkE8nRepo } from "../chat-chunk/chat-chunk-e8n-repo.js";
import { ChatChunkMapper } from "../chat-chunk/chat-chunk-mapper.js";
import { ChatChunkRepo } from "../chat-chunk/chat-chunk-repo.js";
import { ChatMessageE8nRepo } from "../chat-message/chat-message-e8n-repo.js";
import { ChatMessageMapper } from "../chat-message/chat-message-mapper.js";
import { ChatMessageRepo } from "../chat-message/chat-message-repo.js";
import { ChatMessageId } from "../chat-message/chat-message-schemas.js";
import { ChatId } from "../chat/chat-schemas.js";
import {
  AiSendTextInput,
  AiSendTextService,
  ModelProviderMap,
} from "../common-schemas.js";
import { DbService } from "../db/db-service.js";
import { E8nService } from "../e8n/e8n-service.js";
import { GoogleGenAiService } from "../google-gen-ai/google-gen-ai-service.js";
import { UserDefaultPromptRepo } from "../user-default-prompt/user-default-prompt-repo.js";
import { UserPromptMapper } from "../user-prompt/user-prompt-mapper.js";
import { UserId } from "../user/user-schemas.js";
import { inspect } from "../utils.js";
import { XaiService } from "../xai/xai-service.js";

interface AiRouterSendInput {
  userId: UserId;
  chatId: ChatId;
  userChatMessageId: ChatMessageId;
  modelChatMessageId: ChatMessageId;
}

@Injectable()
export class AiTextSenderService {
  readonly #logger = new Logger(AiTextSenderService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly e8nService: E8nService,
    private readonly googleGenAiService: GoogleGenAiService,
    private readonly xaiService: XaiService,
    private readonly chatChunkMapper: ChatChunkMapper,
  ) {}

  send(input: AiRouterSendInput): void {
    this.#send(input).catch((e) => {
      this.#logger.error(`Failed to send. ${inspect(e)}`);
    });
  }

  private async transactionBeforeExternalCall(input: AiRouterSendInput) {
    const { userId, chatId, userChatMessageId, modelChatMessageId } = input;

    return await this.dbService.db.$transaction(async (tx) => {
      const chatMessageE8nRepo = new ChatMessageE8nRepo(tx, this.e8nService);
      const modelChatMessage = await chatMessageE8nRepo.tryTransitionStatus(
        userId,
        {
          chatId,
          chatMessageId: modelChatMessageId,
          expectedStatus: "pending",
          nextStatus: "processing",
        },
        {
          withChatPrompt: true,
        },
      );

      if (!modelChatMessage) {
        throw new Error(
          `Failed to transition chat message: ${modelChatMessageId}.`,
        );
      }

      const { success, data: model } = Model.safeParse(modelChatMessage.model);
      if (!success) {
        throw new Error(`Invalid model: ${modelChatMessage.model}.`);
      }

      if (!Reflect.has(ModelProviderMap, model)) {
        throw new Error(`Invalid model provider. model: ${model}`);
      }

      const chatMessageRepo = new ChatMessageRepo(tx);
      const { entities: chatMessages } = await chatMessageRepo.list(userId, {
        chatId,
        direction: "forward",
        cursor: userChatMessageId,
        limit: 10,
      });

      const userDefaultPromptRepo = new UserDefaultPromptRepo(tx);
      const userDefaultPrompt = await userDefaultPromptRepo.tryGet(userId);

      return {
        model,
        modelChatMessage,
        chatMessages,
        userDefaultPrompt,
      };
    });
  }

  async #parseInput(
    txResult: Awaited<
      ReturnType<AiTextSenderService["transactionBeforeExternalCall"]>
    >,
  ): Promise<AiSendTextInput> {
    const { model, userDefaultPrompt, modelChatMessage, chatMessages } =
      txResult;

    const userPromptMapper = new UserPromptMapper(this.e8nService);
    const userDefaultPromptData = userDefaultPrompt?.userPrompt
      ? userPromptMapper.toData(userDefaultPrompt.userPrompt)
      : null;

    const chatUserPromptData = modelChatMessage.chat?.userPrompt
      ? userPromptMapper.toData(modelChatMessage.chat.userPrompt)
      : null;

    const prompt = [
      userDefaultPromptData?.text ?? "",
      chatUserPromptData?.text ?? "",
    ]
      .filter((x) => x)
      .join("\n");

    const chatMessageMapper = new ChatMessageMapper(this.e8nService);
    const modelChatMessageData = chatMessageMapper.toData(modelChatMessage);
    const chatMessageDatas = chatMessages.map((x) =>
      chatMessageMapper.toData(x),
    );

    {
      // NOTE: History for AI should start with 'user' role.
      while (true) {
        const oldest = chatMessageDatas.at(chatMessageDatas.length - 1);
        if (!oldest) {
          break;
        }

        if (oldest.role === "user") {
          break;
        }

        chatMessageDatas.pop();
      }
      chatMessageDatas.reverse();
    }

    const texts = [
      ...chatMessageDatas.map((x) => {
        return {
          role: x.role,
          text: x.text,
        };
      }),
      {
        role: modelChatMessageData.role,
        text: modelChatMessageData.text,
      },
    ];

    return {
      model,
      prompt,
      texts,
    };
  }

  #parseService(model: Model): AiSendTextService {
    const modelProvider = ModelProviderMap[model];
    if (modelProvider === "google-gen-ai") {
      return this.googleGenAiService;
    } else if (modelProvider === "xai") {
      return this.xaiService;
    }

    throw new Error(`Invalid model provider. model: ${model}.`);
  }

  private async externalCall(
    input: {
      chatMessageId: ChatMessageId;
    } & Awaited<
      ReturnType<AiTextSenderService["transactionBeforeExternalCall"]>
    >,
  ) {
    const { chatMessageId, model } = input;

    const sendTextService = this.#parseService(model);
    const sendTextInput = await this.#parseInput(input);

    let index = 1;
    let isSuccess = false;
    try {
      for await (const sendTextOutput of sendTextService.sendText(
        sendTextInput,
      )) {
        const chatChunkRepo = new ChatChunkE8nRepo(
          this.dbService.db,
          this.e8nService,
        );
        await chatChunkRepo.create({
          ...sendTextOutput,
          chatMessageId,
          index,
        });

        index += 1;
      }

      isSuccess = true;
    } catch (e) {
      isSuccess = false;

      this.#logger.error(`Failed on external call. ${inspect(e)}`);
    }

    return {
      index,
      isSuccess,
    };
  }

  async #transactionAfterExternalCall(
    input: {
      userId: UserId;
      chatId: ChatId;
      chatMessageId: ChatMessageId;
    } & Awaited<ReturnType<AiTextSenderService["externalCall"]>>,
  ) {
    const { userId, chatId, chatMessageId, index, isSuccess } = input;

    await this.dbService.db.$transaction(async (tx) => {
      const chatChunkE8nRepo = new ChatChunkE8nRepo(tx, this.e8nService);
      await chatChunkE8nRepo.create({
        chatMessageId,
        index,
        isSuccess,
        text: "",
        reasoningText: "",
        rawData: "",
      });

      const chatChunkRepo = new ChatChunkRepo(tx);
      const { text, reasoningText } = await chatChunkRepo.calculateTexts({
        userId,
        chatId,
        chatMessageId,
        index,
        chatChunkMapper: this.chatChunkMapper,
      });

      const chatMessageE8nRepo = new ChatMessageE8nRepo(tx, this.e8nService);
      await chatMessageE8nRepo.tryTransitionStatus(userId, {
        chatId,
        chatMessageId,
        expectedStatus: "processing",
        nextStatus: isSuccess ? "succeeded" : "failed",
        text,
        reasoningText,
      });
    });
  }

  async #send(input: AiRouterSendInput): Promise<void> {
    const { userId, chatId, modelChatMessageId: chatMessageId } = input;

    const txResult = await this.transactionBeforeExternalCall(input);
    const externalResult = await this.externalCall({
      ...txResult,
      chatMessageId,
    });
    await this.#transactionAfterExternalCall({
      ...externalResult,
      userId,
      chatId,
      chatMessageId,
    });
  }
}
