import type { MaybePromise } from "@/types/common";
import {
  Message,
  type MessageForHistory,
  type MessageId,
} from "@/types/message";
import type { MessageChunkIndex } from "@/types/message-chunk";
import { ModelProviderMap } from "@/types/model";
import { Role } from "@/types/role";
import type { TaskInput } from "@/types/task";
import type { UserId } from "@/types/user";
import type { Prisma } from "@prisma/client";
import { match } from "ts-pattern";
import type { Simplify } from "type-fest";
import type { ServiceRegistry } from "../service-registry";
import { MessageService } from "./message-service";
import { notify } from "./pg";
import { UserUsageLimitService } from "./user-usage-limit-service";

export type ValidatedModelMessage = Simplify<
  Omit<Message, "model"> & {
    model: NonNullable<Message["model"]>;
  }
>;

export type SendMessageToAiInput = {
  userMessage: Message;
  modelMessage: ValidatedModelMessage;
  messagesForHistory: MessageForHistory[];
  onMessageChunkReceived: OnMessageChunkReceived;
};

export type OnMessageChunkReceivedInput = {
  text: string;
  rawData: Prisma.InputJsonValue;
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

    const inputValues = await this.getInputValues({
      userId,
      userMessageId,
      modelMessageId,
    });
    const { userMessage } = inputValues;
    const validateRes = this.validateInputValues(inputValues);
    if (!validateRes.ok) return;
    const { modelMessage } = validateRes;

    const messagesForHistory = await this.listForHistory({
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
        userMessage,
        modelMessage,
        messagesForHistory,
        onMessageChunkReceived,
      };
      await match(modelProviderKey)
        .with("google-gen-ai", () =>
          this.service.googleGenAi.sendMessageToAi(input)
        )
        .with("open-ai", () => this.service.openAi.sendMessageToAi(input))
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

  private async listForHistory(input: {
    userId: UserId;
    modelMessage: Message;
  }) {
    const { userId, modelMessage } = input;
    const xs = await this.service.message.listForHistory({
      userId,
      modelMessage,
    });
    while (true) {
      const x = xs.at(0);
      if (!x) break;
      if (x.role === Role.enum.user) break;
      xs.shift();
    }
    return xs;
  }

  private async getInputValues(input: {
    userId: UserId;
    userMessageId: MessageId;
    modelMessageId: MessageId;
  }) {
    const { userId, userMessageId, modelMessageId } = input;
    const [userMessageRaw, modelMessageRaw] = await Promise.all([
      this.service.message.get({
        userId,
        messageId: userMessageId,
      }),
      this.service.message.get({
        userId,
        messageId: modelMessageId,
        include: {
          chat: true,
        },
      }),
    ]);

    const userMessage = Message.parse(userMessageRaw);
    const modelMessage = Message.parse(modelMessageRaw);
    return {
      userMessage,
      modelMessage,
    };
  }

  private validateInputValues(input: {
    userMessage: Message;
    modelMessage: Message;
  }):
    | {
        ok: true;
        modelMessage: ValidatedModelMessage;
      }
    | { ok: false } {
    const { userMessage, modelMessage } = input;
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
      modelMessage: {
        ...modelMessage,
        model: modelMessage.model,
      },
    };
  }
}
