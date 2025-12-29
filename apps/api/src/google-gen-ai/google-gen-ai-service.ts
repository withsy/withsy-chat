import { GoogleGenAI } from "@google/genai";
import { Injectable } from "@nestjs/common";
import {
  AiSendTextInput,
  AiSendTextOutput,
  GoogleGenAiRoleMap,
  ModelProviderMap,
  Role,
} from "../common-schemas.js";
import { ConfigService } from "../config/config-service.js";

@Injectable()
export class GoogleGenAiService {
  readonly #client: GoogleGenAI;

  constructor(configService: ConfigService) {
    this.#client = new GoogleGenAI({
      apiKey: configService.geminiApiKey,
    });
  }

  async *sendText(input: AiSendTextInput): AsyncIterable<AiSendTextOutput> {
    const { model, prompt, texts } = input;

    if (ModelProviderMap[model] !== "google-gen-ai") {
      throw new Error(`Invalid google-gen-ai model: ${model}.`);
    }

    const contents = texts.map(({ role, text }) => {
      return {
        role: GoogleGenAiRoleMap[Role.parse(role)],
        parts: [{ text }],
      };
    });

    const stream = await this.#client.models.generateContentStream({
      model,
      config: {
        systemInstruction: prompt ?? undefined,
      },
      contents,
    });

    for await (const response of stream) {
      const text =
        response.candidates
          ?.flatMap((x) => x.content?.parts?.map((x) => x.text) ?? "")
          .join("") ?? "";
      const rawData = JSON.stringify(response);

      yield {
        text,
        reasoningText: "",
        rawData,
      };
    }
  }
}
