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
import type { ServiceRegistry } from "../service-registry";
import type { SendMessageToAiInput } from "./model-route";

const MAX_CHUNK_BUFFER_LENGTH = 16;

export class OpenAiService {
  private openai: OpenAI;

  constructor(private readonly service: ServiceRegistry) {
    this.openai = new OpenAI({ apiKey: service.env.openaiApiKey });
  }

  async sendMessageToAi(input: SendMessageToAiInput) {
    return await OpenAiService.sendMessageToAi(this.openai, input);
  }

  static async sendMessageToAi(openai: OpenAI, input: SendMessageToAiInput) {
    const { model, promptText, messagesForAi, onMessageChunkReceived } = input;

    const histories = messagesForAi.map((x) =>
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
    const messages: ChatCompletionMessageParam[] = [];
    if (promptText.length > 0)
      messages.push({ role: "system", content: promptText });
    messages.push(...histories);

    const stream = await openai.chat.completions.create({
      model,
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
