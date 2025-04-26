import { Role, RoleGoogleGenAiMap } from "@/types/role";
import { GoogleGenAI, type Part } from "@google/genai";
import { envConfig } from "../env-config";
import type { ServiceRegistry } from "../service-registry";
import type { SendMessageToAiInput } from "./model-route";

export class GoogleGenAiService {
  private ai: GoogleGenAI;

  constructor(private readonly service: ServiceRegistry) {
    this.ai = new GoogleGenAI({ apiKey: envConfig.geminiApiKey });
  }

  async sendMessageToAi(input: SendMessageToAiInput) {
    const {
      userMessage,
      modelMessage,
      promptText,
      messagesForHistory,
      onMessageChunkReceived,
    } = input;

    const contents = messagesForHistory.map((x) => ({
      role: RoleGoogleGenAiMap[Role.parse(x.role)],
      parts: [{ text: x.text }],
    }));
    contents.push({ role: "user", parts: [{ text: userMessage.text }] });

    const stream = await this.ai.models.generateContentStream({
      model: modelMessage.model,
      config: {
        systemInstruction: promptText,
      },
      contents,
    });

    for await (const chunk of stream) {
      const texts =
        chunk.candidates?.flatMap(
          (c) =>
            c.content?.parts?.map((p) => p.text).filter((t) => t != null) ?? []
        ) ?? [];
      const text = texts.join("");
      const rawData = JSON.stringify(chunk);
      await onMessageChunkReceived({ text, rawData });
    }
  }
}
