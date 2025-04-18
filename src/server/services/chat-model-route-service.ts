import {
  ChatChunkIndex,
  ChatMessage,
  ChatMessageId,
  ChatModelProviderMap,
  ChatRole,
  type ChatMessageForHistory,
} from "@/types/chat";
import type { JsonValue, MaybePromise } from "@/types/common";
import type { TaskInput } from "@/types/task";
import type { UserId } from "@/types/user";
import { match } from "ts-pattern";
import type { Simplify } from "type-fest";
import type { ServiceRegistry } from "../service-registry";
import { notify } from "./pg";

export type ValidatedUserChatMessage = Simplify<
  Omit<ChatMessage, "text"> & {
    text: NonNullable<ChatMessage["text"]>;
  }
>;
export type ValidatedModelChatMessage = Simplify<
  Omit<ChatMessage, "model"> & {
    model: NonNullable<ChatMessage["model"]>;
  }
>;

export type SendChatToAiInput = {
  userChatMessage: ValidatedUserChatMessage;
  modelChatMessage: ValidatedModelChatMessage;
  chatMessagesForHistory: ChatMessageForHistory[];
  onChatChunkReceived: OnChatChunkReceived;
};

export type OnChatChunkReceivedInput = {
  text: string;
  rawData: JsonValue;
};
export type OnChatChunkReceived = (
  input: OnChatChunkReceivedInput
) => MaybePromise<void>;

export class ChatModelRouteService {
  constructor(private readonly service: ServiceRegistry) {}

  async onSendChatToAiTask(
    input: TaskInput<"chat_model_route_send_chat_to_ai">
  ) {
    const { userId, userChatMessageId, modelChatMessageId } = input;
    const chatMessage =
      await this.service.chatMessage.transitPendingToProcessing(userId, {
        chatMessageId: modelChatMessageId,
      });
    if (!chatMessage) return;

    const inputValues = await this.getInputValues({
      userId,
      userChatMessageId,
      modelChatMessageId,
    });
    const validateRes = this.validateInputValues(inputValues);
    if (!validateRes.ok) return;
    const { userChatMessage, modelChatMessage } = validateRes;

    const chatMessagesForHistory = await this.listForHistory({
      userId,
      modelChatMessage,
    });

    try {
      const modelProviderKey = ChatModelProviderMap[modelChatMessage.model];

      let chunkIndex: ChatChunkIndex = 0;
      const onChatChunkReceived: OnChatChunkReceived = async (input) => {
        const { text, rawData } = input;
        await this.service.chatChunk.add({
          chatMessageId: modelChatMessage.id,
          chunkIndex,
          text,
          rawData,
        });
        await notify(this.service.pool, "chat_chunk_created", {
          status: "created",
          chatMessageId: modelChatMessage.id,
          chunkIndex,
        });

        chunkIndex += 1;
      };

      const input: SendChatToAiInput = {
        userChatMessage,
        modelChatMessage,
        chatMessagesForHistory,
        onChatChunkReceived,
      };
      await match(modelProviderKey)
        .with("google-gen-ai", () =>
          this.service.googleGenAi.sendChatToAi(input)
        )
        .with("open-ai", () => this.service.openAi.sendChatToAi(input))
        .exhaustive();

      const { text } = await this.service.chatChunk.buildText(
        userId,
        modelChatMessageId
      );
      await this.service.chatMessage.transitProcessingToSucceeded(userId, {
        chatMessageId: modelChatMessageId,
        text,
      });
    } catch (e) {
      console.error("Google Gen AI send chat failed. error:", e);
      await this.service.chatMessage.tryTransitProcessingToFailed(userId, {
        chatMessageId: modelChatMessageId,
      });
    } finally {
      await notify(this.service.pool, "chat_chunk_created", {
        status: "completed",
        chatMessageId: modelChatMessageId,
      });
    }
  }

  private async listForHistory(input: {
    userId: UserId;
    modelChatMessage: Simplify<Pick<ChatMessage, "id" | "chatId">>;
  }) {
    const { userId, modelChatMessage } = input;
    const xs = await this.service.chatMessage.listForHistory(userId, {
      modelChatMessage,
    });
    while (true) {
      const x = xs.at(0);
      if (!x) break;
      if (x.role === ChatRole.enum.user) break;
      xs.shift();
    }
    return xs;
  }

  private async getInputValues(input: {
    userId: UserId;
    userChatMessageId: ChatMessageId;
    modelChatMessageId: ChatMessageId;
  }) {
    const { userId, userChatMessageId, modelChatMessageId } = input;
    const [userChatMessageRaw, modelChatMessageRaw] = await Promise.all([
      this.service.chatMessage.find(userId, {
        chatMessageId: userChatMessageId,
      }),
      this.service.chatMessage.find(userId, {
        chatMessageId: modelChatMessageId,
      }),
    ]);

    const userChatMessage = ChatMessage.parse(userChatMessageRaw);
    const modelChatMessage = ChatMessage.parse(modelChatMessageRaw);
    return {
      userChatMessage,
      modelChatMessage,
    };
  }

  private validateInputValues(input: {
    userChatMessage: ChatMessage;
    modelChatMessage: ChatMessage;
  }):
    | {
        ok: true;
        userChatMessage: ValidatedUserChatMessage;
        modelChatMessage: ValidatedModelChatMessage;
      }
    | { ok: false } {
    const { userChatMessage, modelChatMessage } = input;
    if (userChatMessage.text == null) {
      console.error(
        "User chat message text must not be null. userChatMessageId:",
        userChatMessage.id
      );
      return { ok: false };
    }

    if (modelChatMessage.model == null) {
      console.error(
        "Model chat message model must not be null. modelChatMessageId:",
        modelChatMessage.id
      );
      return { ok: false };
    }

    if (userChatMessage.chatId !== modelChatMessage.chatId) {
      console.error("Chat id is mismatched.");
      return { ok: false };
    }

    return {
      ok: true,
      userChatMessage: {
        ...userChatMessage,
        text: userChatMessage.text,
      },
      modelChatMessage: {
        ...modelChatMessage,
        model: modelChatMessage.model,
      },
    };
  }
}
