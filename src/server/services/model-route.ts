import { Message, UserDefaultPrompt } from "@/types";
import type { MaybePromise } from "@/types/common";
import type { MessageChunkIndex, MessageId } from "@/types/id";
import { Model, ModelProviderMap } from "@/types/model";
import { Role } from "@/types/role";
import type { TaskInput } from "@/types/task";
import type { UserId } from "@/types/user";
import { match } from "ts-pattern";
import type { Simplify } from "type-fest";
import type { ServiceRegistry } from "../service-registry";
import { MessageService } from "./message";
import { notify } from "./pg";
import { UserUsageLimitService } from "./user-usage-limit";

export type ValidatedModelMessage = Simplify<
  Omit<Message.Data, "model"> & {
    model: NonNullable<Message.Data["model"]>;
  }
>;

export type SendMessageToAiInput = {
  model: Model;
  promptText: string;
  messagesForAi: Message.DataForAi[];
  onMessageChunkReceived: OnMessageChunkReceived;
};

export type OnMessageChunkReceivedInput = {
  text: string;
  rawData: string;
};
export type OnMessageChunkReceived = (
  input: OnMessageChunkReceivedInput
) => MaybePromise<void>;

export class ModelRouteService {
  constructor(private readonly service: ServiceRegistry) {}

  async onSendMessageToAiTask(
    input: TaskInput<"model_route_send_message_to_ai">
  ) {
    const { userId, userMessageId, modelMessageId } = input;
    const chatMessage = await this.service.message.transitPendingToProcessing({
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

    try {
      const modelProviderKey = ModelProviderMap[modelMessage.model];

      let index: MessageChunkIndex = 0;
      const onMessageChunkReceived: OnMessageChunkReceived = async (input) => {
        const { text, rawData } = input;
        await this.service.messageChunk.add({
          messageId: modelMessage.id,
          index,
          text,
          rawData,
        });
        await notify(this.service.pgPool, "message_chunk_created", {
          status: "created",
          messageId: modelMessage.id,
          index,
        });

        index += 1;
      };

      const input: SendMessageToAiInput = {
        model: modelMessage.model,
        promptText,
        messagesForAi,
        onMessageChunkReceived,
      };
      await match(modelProviderKey)
        .with("google-gen-ai", () =>
          this.service.googleGenAi.sendMessageToAi(input)
        )
        // .with("open-ai", () => this.service.openAi.sendMessageToAi(input))
        .with("x-ai", () => this.service.xAi.sendMessageToAi(input))
        .exhaustive();

      await this.service.message.transitProcessingToSucceeded({
        userId,
        messageId: modelMessageId,
      });
    } catch (e) {
      console.error("Send chat to ai failed. error:", e);
      await this.service.db.$transaction(async (tx) => {
        await MessageService.tryTransitProcessingToFailed(tx, {
          userId,
          messageId: modelMessageId,
        });
        await UserUsageLimitService.lockAndCompensate(tx, { userId });
      });
    } finally {
      await notify(this.service.pgPool, "message_chunk_created", {
        status: "completed",
        messageId: modelMessageId,
      });
    }
  }

  private async messagesForAi(input: {
    userId: UserId;
    modelMessage: Message.Data;
  }): Promise<Message.DataForAi[]> {
    const { userId, modelMessage } = input;
    const entities = await this.service.message.listForAi({
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
      text: this.service.encryption.decrypt(x.textEncrypted),
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
        userMessage: Message.Data;
        modelMessage: ValidatedModelMessage;
        userDefaultPrompt: UserDefaultPrompt.GetOutput;
      }
    | { ok: false }
  > {
    const { userId, userMessageId, modelMessageId } = input;

    const [userMessageRaw, modelMessageRaw, userDefaultPromptRaw] =
      await Promise.all([
        this.service.message.getForAi({ userId, messageId: userMessageId }),
        this.service.message.getForAi({
          userId,
          messageId: modelMessageId,
          include: { chat: true },
        }),
        this.service.userDefaultPrompt.get(userId),
      ]);

    const userMessage = this.service.message.decrypt(userMessageRaw);
    const modelMessage = this.service.message.decrypt(modelMessageRaw);
    const userDefaultPrompt =
      UserDefaultPrompt.GetOutput.parse(userDefaultPromptRaw);
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
