import { Role, RoleGoogleGenAiMap } from "@/types/role";
import { GoogleGenAI } from "@google/genai";
import { inspect } from "node:util";
import type { ServiceRegistry } from "../service-registry";
import type { SendMessageToAiInput } from "./model-route";

export class GoogleGenAiService {
  private ai: GoogleGenAI;

  constructor(private readonly service: ServiceRegistry) {
    this.ai = new GoogleGenAI({ apiKey: this.service.env.geminiApiKey });
  }

  async sendMessageToAi(input: SendMessageToAiInput) {
    const { model, promptText, messagesForHistory, onMessageChunkReceived } =
      input;

    const contents = messagesForHistory.map((x) => ({
      role: RoleGoogleGenAiMap[Role.parse(x.role)],
      parts: [{ text: x.text }],
    }));

    if (this.service.env.nodeEnv === "development")
      console.log(
        "GoogleGenAiService.sendMessageToAi. model:",
        model,
        " promptText: ",
        promptText,
        " contents:",
        inspect(contents, { depth: null })
      );

    const stream = await this.ai.models.generateContentStream({
      model,
      config: {
        systemInstruction: promptText.length > 0 ? promptText : undefined,
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
