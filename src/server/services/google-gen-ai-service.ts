import { ChatRole, type ChatChunkIndex } from "@/types/chat";
import { type TaskInput } from "@/types/task";
import { GoogleGenAI, type Part } from "@google/genai";
import { envConfig } from "../env-config";
import type { ServiceRegistry } from "../service-registry";
import { notify } from "./pg";

const FILE_UPLOAD_STRATEGY: "fileData" | "inlineData" = "inlineData";

export class GoogleGenAiService {
  private ai: GoogleGenAI;

  constructor(private readonly service: ServiceRegistry) {
    this.ai = new GoogleGenAI({ apiKey: envConfig.geminiApiKey });
  }

  async onSendChatTask(input: TaskInput<"google_gen_ai_send_chat">) {
    const { userId, userChatMessageId, modelChatMessageId } = input;
    const chatMessage =
      await this.service.chatMessage.transitPendingToProcessing(userId, {
        chatMessageId: modelChatMessageId,
      });
    if (!chatMessage) return;

    const [userChatMessage, modelChatMessage, chatMessageFiles] =
      await Promise.all([
        this.service.chatMessage.find(userId, {
          chatMessageId: userChatMessageId,
        }),
        this.service.chatMessage.find(userId, {
          chatMessageId: modelChatMessageId,
        }),
        this.service.chatMessageFile.list(userId, {
          chatMessageId: userChatMessageId,
        }),
      ]);
    if (userChatMessage.text == null) {
      console.error(
        "User chat message text must not be null. userChatMessageId:",
        userChatMessageId
      );
      return;
    }

    if (modelChatMessage.model == null) {
      console.error(
        "Model chat message model must not be null. modelChatMessageId:",
        modelChatMessageId
      );
      return;
    }

    if (userChatMessage.chatId !== modelChatMessage.chatId) {
      console.error("Chat id is mismatched.");
      return;
    }

    const msgsForHistory = await this.service.chatMessage.listForAiChatHistory(
      userId,
      { modelChatMessage }
    );
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
      const parts: Part[] = [{ text: userChatMessage.text }];
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
        model: modelChatMessage.model,
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

        await this.service.chatChunk.add({
          chatMessageId: modelChatMessageId,
          chunkIndex,
          // TODO: Parse chunk to rawData.
          rawData: JSON.stringify(chunk),
          text: texts.join(""),
        });
        await notify(this.service.pool, "chat_chunk_created", {
          status: "created",
          chatMessageId: modelChatMessageId,
          chunkIndex,
        });

        chunkIndex += 1;
      }

      const builded = await this.service.chatChunk.buildText(
        userId,
        modelChatMessageId
      );
      await this.service.chatMessage.transitProcessingToSucceeded(userId, {
        chatMessageId: modelChatMessageId,
        builded,
      });
    } catch (e) {
      console.error("Google Gen AI send chat failed. error:", e);
      await this.service.chatMessage.transitProcessingToFailed(
        modelChatMessageId
      );
    } finally {
      await notify(this.service.pool, "chat_chunk_created", {
        status: "completed",
        chatMessageId: modelChatMessageId,
      });
    }
  }
}
