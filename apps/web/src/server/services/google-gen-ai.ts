import { Role, RoleGoogleGenAiMap } from "@/types/role";
import { GoogleGenAI } from "@google/genai";
import { inspect } from "node:util";
import type { SendMessageToAiInput } from "./model-route";

export class GoogleGenAiService {
  private readonly ai: GoogleGenAI;

  constructor() {
    const { GEMINI_API_KEY } = process.env;
    if (!GEMINI_API_KEY) {
      throw new Error("Invalid GEMINI_API_KEY.");
    }

    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  async sendMessageToAi(input: SendMessageToAiInput) {
    const { model, promptText, messagesForAi, onMessageChunkReceived } = input;

    const contents = messagesForAi.map((x) => ({
      role: RoleGoogleGenAiMap[Role.parse(x.role)],
      parts: [{ text: x.text }],
    }));

    if (process.env.NODE_ENV === "development") {
      console.log(
        "GoogleGenAiService.sendMessageToAi. model:",
        model,
        " promptText: ",
        promptText,
        " contents:",
        inspect(contents, { depth: null })
      );
    }

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
      await onMessageChunkReceived({ rawData, text, reasoningText: "" });
    }
  }
}
