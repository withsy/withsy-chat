import { ChatRole, type ChatChunkIndex } from "@/types/chat";
import { type TaskInput } from "@/types/task";
import { GoogleGenAI, type Part } from "@google/genai";
import { envConfig } from "../env-config";
import type { ServiceRegistry } from "../service-registry";
import { notify } from "./pg";

const FILE_UPLOAD_STRATEGY: "fileData" | "inlineData" = "inlineData";

export class GoogleGenAiService {
  private ai: GoogleGenAI;

  constructor(private readonly s: ServiceRegistry) {
    this.ai = new GoogleGenAI({ apiKey: envConfig.geminiApiKey });
  }

  // WIP
  async onSendChatTask(input: TaskInput<"google_gen_ai_send_chat">) {
    const { userChatMessageId, modelChatMessageId } = input;
    const chatMessage = await this.s.chatMessage.transitPendingToProcessing(
      modelChatMessageId
    );
    if (!chatMessage) return;

    const [
      { text, chatId: userChatId },
      { model, chatId: modelChatId, parentId: modelParentId },
      chatMessageFiles,
    ] = await Promise.all([
      this.s.chatMessage.findById(userChatMessageId, ["chatId", "text"]),
      this.s.chatMessage.findById(modelChatMessageId, [
        "chatId",
        "model",
        "parentId",
      ]),
      this.s.chatMessageFile.findAllByChatMessageId(userChatMessageId, [
        "fileUri",
        "mimeType",
      ]),
    ]);
    if (text == null) {
      console.error(
        "User chat message text must not be null. userChatMessageId:",
        userChatMessageId
      );
      return;
    }

    if (model == null) {
      console.error(
        "Model chat message model must not be null. modelChatMessageId:",
        modelChatMessageId
      );
      return;
    }

    if (userChatId !== modelChatId) {
      console.error("Chat id is mismatched.");
      return;
    }

    const msgsForHistory = await this.s.chatMessage.listForAiChatHistory({
      modelChatId,
      modelChatMessageId,
      modelParentId,
    });
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
      const parts: Part[] = [{ text }];
      for (const { fileUri, mimeType } of chatMessageFiles) {
        if (FILE_UPLOAD_STRATEGY === "fileData")
          parts.push({ fileData: { fileUri, mimeType } });
        else {
          const res = await fetch(fileUri);
          if (!res.ok)
            throw new Error(
              `HTTP error occurred. status: ${
                res.status
              } ${await res.text()} url: ${fileUri}`
            );
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64String = buffer.toString("base64");
          parts.push({ inlineData: { data: base64String, mimeType } });
        }
      }

      const chat = this.ai.chats.create({
        model,
        history,
      });
      const stream = await chat.sendMessageStream({
        message: parts,
      });

      let chunkIndex: ChatChunkIndex = 0;

      for await (const chunk of stream) {
        const texts =
          chunk.candidates?.flatMap(
            (c) =>
              c.content?.parts?.map((p) => p.text).filter((t) => t != null) ??
              []
          ) ?? [];

        await this.s.chatChunk.add({
          chatMessageId: modelChatMessageId,
          chunkIndex,
          // TODO: Parse chunk to rawData.
          rawData: JSON.stringify(chunk),
          text: texts.join(""),
        });
        await notify(this.s.pool, "chat_chunk_created", {
          status: "created",
          chatMessageId: modelChatMessageId,
          chunkIndex,
        });

        chunkIndex += 1;
      }

      const builded = await this.s.chatChunk.buildText(modelChatMessageId);
      await this.s.chatMessage.transitProcessingToSucceeded(
        modelChatMessageId,
        builded
      );
    } catch (e) {
      console.error("Google Gen AI send chat failed. error:", e);
      await this.s.chatMessage.transitProcessingToFailed(modelChatMessageId);
    } finally {
      await notify(this.s.pool, "chat_chunk_created", {
        status: "completed",
        chatMessageId: modelChatMessageId,
      });
    }
  }
}
