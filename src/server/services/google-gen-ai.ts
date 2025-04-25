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
      messagesForHistory,
      onMessageChunkReceived,
    } = input;

    const history = messagesForHistory.map((x) => ({
      role: RoleGoogleGenAiMap[Role.parse(x.role)],
      parts: [{ text: x.text }],
    }));
    const parts: Part[] = [{ text: userMessage.text }];

    const chat = this.ai.chats.create({
      model: modelMessage.model,
      history,
    });

    const stream = await chat.sendMessageStream({
      message: parts,
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
