import { Injectable } from "@nestjs/common";
import { OpenAI } from "openai";
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources/index.mjs";
import {
  AiSendTextInput,
  AiSendTextOutput,
  ModelProviderMap,
  OpenAiRoleMap,
  Role,
} from "../common-schemas.js";
import { ConfigService } from "../config/config-service.js";

@Injectable()
export class XaiService {
  readonly #client: OpenAI;

  constructor(configService: ConfigService) {
    this.#client = new OpenAI({
      baseURL: "https://api.x.ai/v1",
      apiKey: configService.xaiApiKey,
    });
  }

  async *sendText(input: AiSendTextInput): AsyncIterable<AiSendTextOutput> {
    const { model, prompt, texts } = input;

    if (ModelProviderMap[model] !== "xai") {
      throw new Error(`Invalid xai model: ${model}.`);
    }

    const messages: ChatCompletionMessageParam[] = [];
    if (prompt) {
      messages.push({ role: "system", content: prompt });
    }

    messages.push(
      ...texts.map(({ role, text }) => {
        const openAiRole = OpenAiRoleMap[Role.parse(role)];
        if (openAiRole === "user") {
          return {
            role: openAiRole,
            content: [{ type: "text", text }],
          } satisfies ChatCompletionUserMessageParam;
        }

        if (openAiRole === "assistant") {
          return {
            role: openAiRole,
            content: [{ type: "text", text }],
          } satisfies ChatCompletionAssistantMessageParam;
        }

        if (openAiRole === "system") {
          return {
            role: openAiRole,
            content: [{ type: "text", text }],
          } satisfies ChatCompletionSystemMessageParam;
        }

        throw new Error(`Invalid role: ${role}.`);
      }),
    );

    const stream = await this.#client.chat.completions.create({
      model,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices.at(0)?.delta.content ?? "";
      const reasoningText: string =
        Reflect.get(chunk.choices.at(0)?.delta ?? {}, "reasoning_content") ??
        "";
      const rawData = JSON.stringify(chunk);

      yield {
        text,
        reasoningText,
        rawData,
      };
    }
  }
}
