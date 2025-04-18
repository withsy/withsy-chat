import { ChatRole, ChatRoleGoogleGenAiMap } from "@/types/chat";
import { GoogleGenAI, type Part } from "@google/genai";
import { envConfig } from "../env-config";
import type { ServiceRegistry } from "../service-registry";
import type { SendChatToAiInput } from "./chat-model-route-service";

export class GoogleGenAiService {
  private ai: GoogleGenAI;

  constructor(private readonly service: ServiceRegistry) {
    this.ai = new GoogleGenAI({ apiKey: envConfig.geminiApiKey });
  }

  async sendChatToAi(input: SendChatToAiInput) {
    const {
      userChatMessage,
      modelChatMessage,
      chatMessagesForHistory,
      onChatChunkReceived,
    } = input;

    const history = chatMessagesForHistory.map((x) => ({
      role: ChatRoleGoogleGenAiMap[ChatRole.parse(x.role)],
      parts: [{ text: x.text }],
    }));
    const parts: Part[] = [{ text: userChatMessage.text }];

    const chat = this.ai.chats.create({
      model: modelChatMessage.model,
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
      await onChatChunkReceived({ text, rawData });
    }
  }
}
