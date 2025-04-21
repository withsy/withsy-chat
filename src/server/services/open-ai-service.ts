import { ChatRole } from "@/types/chat";
import OpenAI from "openai";
import type {
  ChatCompletionAssistantMessageParam,
  ChatCompletionChunk,
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources";
import { match } from "ts-pattern";
import { envConfig } from "../env-config";
import type { ServiceRegistry } from "../service-registry";
import type { SendChatToAiInput } from "./chat-model-route-service";

const MAX_CHUNK_BUFFER_LENGTH = 64;

export class OpenAiService {
  private openai: OpenAI;

  constructor(private readonly service: ServiceRegistry) {
    this.openai = new OpenAI({ apiKey: envConfig.openaiApiKey });
  }

  async sendChatToAi(input: SendChatToAiInput) {
    const {
      userChatMessage,
      modelChatMessage,
      chatMessagesForHistory,
      onChatChunkReceived,
    } = input;

    const histories = chatMessagesForHistory.map((x) =>
      match(ChatRole.parse(x.role))
        .with(
          "user",
          () =>
            ({
              role: "user",
              content: [{ type: "text", text: x.text }],
            } satisfies ChatCompletionUserMessageParam)
        )
        .with(
          "model",
          () =>
            ({
              role: "assistant",
              content: [{ type: "text", text: x.text }],
            } satisfies ChatCompletionAssistantMessageParam)
        )
        .with(
          "system",
          () =>
            ({
              role: "system",
              content: [{ type: "text", text: x.text }],
            } satisfies ChatCompletionSystemMessageParam)
        )
        .exhaustive()
    );
    const messages: ChatCompletionMessageParam[] = [
      ...histories,
      {
        role: "user",
        content: [{ type: "text", text: userChatMessage.text }],
      },
    ];

    const stream = await this.openai.chat.completions.create({
      model: modelChatMessage.model,
      messages,
      stream: true,
    });

    let text = "";
    let chunks: ChatCompletionChunk[] = [];
    const callOnChatChunkReceived = async () => {
      if (chunks.length === 0) return;
      const rawData = JSON.stringify(chunks);
      await onChatChunkReceived({ text, rawData });
      text = "";
      chunks = [];
    };

    for await (const chunk of stream) {
      const token = chunk.choices[0].delta.content ?? "";
      text += token;
      chunks.push(chunk);
      if (chunks.length >= MAX_CHUNK_BUFFER_LENGTH) {
        await callOnChatChunkReceived();
      }
    }
    await callOnChatChunkReceived();
  }
}
