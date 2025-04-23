import { Role } from "@/types/role";
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
import type { SendMessageToAiInput } from "./model-route-service";

const MAX_CHUNK_BUFFER_LENGTH = 16;

export class OpenAiService {
  private openai: OpenAI;

  constructor(private readonly service: ServiceRegistry) {
    this.openai = new OpenAI({ apiKey: envConfig.openaiApiKey });
  }

  async sendMessageToAi(input: SendMessageToAiInput) {
    const {
      userMessage,
      modelMessage,
      messagesForHistory,
      onMessageChunkReceived,
    } = input;

    const histories = messagesForHistory.map((x) =>
      match(Role.parse(x.role))
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
        content: [{ type: "text", text: userMessage.text }],
      },
    ];

    const stream = await this.openai.chat.completions.create({
      model: modelMessage.model,
      messages,
      stream: true,
    });

    let text = "";
    let chunks: ChatCompletionChunk[] = [];
    const callOnChatChunkReceived = async () => {
      if (chunks.length === 0) return;
      const rawData = JSON.stringify(chunks);
      await onMessageChunkReceived({ text, rawData });
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
