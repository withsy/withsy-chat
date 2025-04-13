import { ChatRole, type ChatChunkIndex } from "@/types/chat";
import { type TaskInput } from "@/types/task";
import { GoogleGenAI } from "@google/genai";
import type { ServiceRegistry } from "./global";
import { notify } from "./pg";

export class GoogleGenAiService {
  private ai: GoogleGenAI;

  constructor(private readonly s: ServiceRegistry) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) throw new Error("Please set GEMINI_API_KEY env.");
    this.ai = new GoogleGenAI({ apiKey: geminiApiKey });
  }

  async onSendChatTask(input: TaskInput<"google_gen_ai_send_chat">) {
    const { userChatMessageId, modelChatMessageId } = input;
    const chatMessage = await this.s
      .get("chatMessage")
      .transitPendingToProcessing(modelChatMessageId);
    if (!chatMessage) return;

    const [{ text, chatId: userChatId }, { model, chatId: modelChatId }] =
      await Promise.all([
        this.s
          .get("chatMessage")
          .findById(userChatMessageId, ["chatId", "text"]),
        this.s
          .get("chatMessage")
          .findById(modelChatMessageId, ["chatId", "model"]),
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

    if (userChatId !== modelChatId) {
      console.error("Chat id is mismatched.");
      return;
    }

    const msgsForHistory = await this.s
      .get("chatMessage")
      .listForAiChatHistory(userChatId);
    while (true) {
      const msg = msgsForHistory.at(0);
      if (!msg) break;
      if (msg.role === ChatRole.enum.user) break;
      msgsForHistory.shift();
    }
    const history = msgsForHistory.map((v) => ({
      role: v.role,
      parts: [{ text: v.text }],
    }));

    try {
      let chunkIndex: ChatChunkIndex = 0;

      const chat = this.ai.chats.create({
        model,
        history,
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

        await this.s.get("chatChunk").add({
          chatMessageId: modelChatMessageId,
          chunkIndex,
          rawData: chunk,
          text: texts.join(""),
        });
        await notify(this.s.get("pool"), "chat_chunk_created", {
          status: "created",
          chatMessageId: modelChatMessageId,
          chunkIndex,
        });

        chunkIndex += 1;
      }

      const builded = await this.s
        .get("chatChunk")
        .buildText(modelChatMessageId);
      await this.s
        .get("chatMessage")
        .transitProcessingToSucceeded(modelChatMessageId, builded);
    } catch (e) {
      console.error("Google Gen AI send chat failed. error:", e);
      await this.s
        .get("chatMessage")
        .transitProcessingToFailed(modelChatMessageId);
    } finally {
      await notify(this.s.get("pool"), "chat_chunk_created", {
        status: "completed",
        chatMessageId: modelChatMessageId,
      });
    }
  }
}
