import type { MaybePromise } from "@/types/common";
import type { MessageChunkIndex, MessageId, UserId } from "@/types/id";
import type { MessageData, MessageDataForAi } from "@/types/message";
import { Model, ModelProviderMap } from "@/types/model";
import { Role } from "@/types/role";
import type { TaskInput } from "@/types/task";
import { UserDefaultPromptGetOutput } from "@/types/user-default-prompt";
import { match } from "ts-pattern";
import type { Simplify } from "type-fest";
import { MessageService } from "./message";
import { notify } from "./pg";
import { UserUsageLimitService } from "./user-usage-limit";
import { inject } from "../service-registry";

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
  private readonly message = inject("message");
  private readonly messageChunk = inject("messageChunk");
  private readonly pgPool = inject("pgPool");
  private readonly googleGenAi = inject("googleGenAi");
  private readonly xAi = inject("xAi");
  private readonly db = inject("db");
  private readonly encryption = inject("encryption");
  private readonly userDefaultPrompt = inject("userDefaultPrompt");

  async onSendMessageToAiTask(
    input: TaskInput<"model_route_send_message_to_ai">
  ) {
    const { userId, userMessageId, modelMessageId } = input;
    const chatMessage = await this.message.transitPendingToProcessing({
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
      await this.messageChunk.create({
        messageId: modelMessage.id,
        index,
        text,
        reasoningText,
        rawData,
        isDone,
      });
      await notify(this.pgPool, "message_chunk_created", {
        messageId: modelMessage.id,
        index,
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
          async () => await this.googleGenAi.sendMessageToAi(input)
        )
        .with("x-ai", async () => await this.xAi.sendMessageToAi(input))
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
        await this.message.transitProcessingToSucceeded({
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
    const entities = await this.message.listForAi({
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
      text: this.encryption.decrypt(x.textEncrypted),
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
        this.message.getForAi({ userId, messageId: userMessageId }),
        this.message.getForAi({
          userId,
          messageId: modelMessageId,
          include: { chat: true },
        }),
        this.userDefaultPrompt.get(userId),
      ]);

    const userMessage = this.message.decrypt(userMessageRaw);
    const modelMessage = this.message.decrypt(modelMessageRaw);
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
