import type { ChatChunkIndex } from "@/types/chat";
import { type TaskInput } from "@/types/task";
import { GoogleGenAI } from "@google/genai";
import type { Registry } from "./global";
import { notify } from "./pg";

export class GoogleGenAiService {
  private ai: GoogleGenAI;

  constructor(private readonly r: Registry) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) throw new Error("Please set GEMINI_API_KEY env.");
    this.ai = new GoogleGenAI({ apiKey: geminiApiKey });
  }

  async onSendChatTask(input: TaskInput<"google_gen_ai_send_chat">) {
    const { userChatMessageId, modelChatMessageId } = input;
    const chatMessage = await this.r
      .get("chatMessage")
      .transitPendingToProcessing(modelChatMessageId);
    if (!chatMessage) return;

    const [{ text }, { model }] = await Promise.all([
      this.r.get("chatMessage").findById(userChatMessageId, ["text"]),
      this.r.get("chatMessage").findById(modelChatMessageId, ["model"]),
    ]);
    if (text == null) {
      console.error(
        "User chat message text must not be null. chatMessageId:",
        userChatMessageId
      );
      return;
    }

    if (model == null) {
      console.error(
        "Model chat message model must not be null. chatMessageId:",
        modelChatMessageId
      );
      return;
    }

    try {
      let chunkIndex: ChatChunkIndex = 0;

      const chat = this.ai.chats.create({
        model,
        // TODO: fill history.
        history: [],
      });
      const stream = await chat.sendMessageStream({
        message: text,
      });

      for await (const chunk of stream) {
        const texts =
          chunk.candidates?.flatMap(
            (c) =>
              c.content?.parts?.map((p) => p.text).filter((t) => t != null) ??
              []
          ) ?? [];

        await this.r.get("chatChunk").add({
          chatMessageId: modelChatMessageId,
          chunkIndex,
          rawData: chunk,
          text: texts.join(""),
        });
        await notify(this.r.get("pool"), "chat_chunk_created", {
          status: "created",
          chatMessageId: modelChatMessageId,
          chunkIndex,
        });

        chunkIndex += 1;
      }

      const builded = await this.r
        .get("chatChunk")
        .buildText(modelChatMessageId);
      await this.r
        .get("chatMessage")
        .transitProcessingToSucceeded(modelChatMessageId, builded);
    } catch (e) {
      console.error("Google Gen AI send chat failed. error:", e);
      await this.r
        .get("chatMessage")
        .transitProcessingToFailed(modelChatMessageId);
    } finally {
      await notify(this.r.get("pool"), "chat_chunk_created", {
        status: "completed",
        chatMessageId: modelChatMessageId,
      });
    }
  }
}
