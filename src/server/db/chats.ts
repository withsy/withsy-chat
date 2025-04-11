import {
  Chat,
  ChatMessageData,
  type ListChatMessages,
  type ReceiveChatMessageStream,
  type SendChatMessage,
  type StartChat,
  type UpdateChat,
} from "@/types/chat";
import type { UserId } from "@/types/user";
import { TRPCError } from "@trpc/server";
import { sql } from "@ts-safeql/sql-tag";
import { ee, ext } from "../global";
import type { Pool, Queryable } from "./core";

export class Chats {
  #pool: Pool;

  constructor(pool: Pool) {
    this.#pool = pool;
  }

  async listChats(userId: UserId): Promise<Chat[]> {
    const rs = await this.#pool.queryable.query<
      {
        id: string;
        userId: string;
        title: string;
        isStarred: boolean;
        createdAt: Date;
        updatedAt: Date;
      }[]
    >(sql`
      SELECT * FROM chats WHERE user_id = ${userId} ::uuid;
    `);
    const chats = await Promise.all(rs.map((v) => Chat.parseAsync(v)));
    return chats;
  }

  async updateChat(input: UpdateChat): Promise<Chat> {
    const { chatId, title, isStarred } = input;
    const rs = await this.#pool.queryable.query<
      {
        id: string;
        userId: string;
        title: string;
        isStarred: boolean;
        createdAt: Date;
        updatedAt: Date;
      }[]
    >(sql`
      UPDATE chats
      SET
        title = COALESCE(${title ?? null}, title),
        is_starred = COALESCE(${isStarred ?? null}, is_starred)
      WHERE id = ${chatId} ::uuid
      RETURNING *;
    `);
    if (rs.length === 0)
      throw new TRPCError({ code: "NOT_FOUND", message: "Chat not found." });

    return rs[0];
  }

  async startChat(userId: UserId, input: StartChat) {
    const { text, model } = input;
    const title = [...text].slice(0, 10).join("");
    const res = await this.#pool.transaction(async (qr) => {
      let chat;
      try {
        const rs = await qr.query<
          {
            id: string;
            userId: string;
            title: string;
            isStarred: boolean;
            createdAt: Date;
            updatedAt: Date;
          }[]
        >(sql`
          INSERT INTO chats
            (user_id, title)
          VALUES
            (${userId} ::uuid, ${title})
          RETURNING *;
        `);
        chat = rs[0];
      } catch (e) {
        console.error("Start chat failed. error:", e);
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

      const res = await createChatMessages(qr, {
        chatId: chat.id,
        text,
        model,
      });
      return { chat, ...res };
    });

    // TODO: refactor to ChatService.
    const { chat, aiChatMessageId } = res;
    ext.gemini.sendChatMessage(chat.id, aiChatMessageId, model, text);
    return res;
  }

  async sendChatMessage(input: SendChatMessage) {
    const res = await createChatMessages(this.#pool.queryable, input);

    // TODO: refactor to ChatService.
    const { chatId, model, text } = input;
    const { aiChatMessageId } = res;
    ext.gemini.sendChatMessage(chatId, aiChatMessageId, model, text);
    return res;
  }

  async listChatMessages(input: ListChatMessages) {
    const { chatId } = input;
    const chatMessages = await this.#pool.queryable.query<
      {
        id: number;
        chatId: string;
        isAi: boolean;
        model: string;
        text: string;
        data: ChatMessageData;
        createdAt: Date;
        updatedAt: Date;
      }[]
    >(sql`
      SELECT * FROM chat_messages WHERE chat_id = ${chatId} ::uuid;
    `);
    return chatMessages;
  }

  // TODO: refactor to ChatService.
  async *receiveChatMessageStream(input: ReceiveChatMessageStream) {
    const { chatMessageId } = input;

    const queue: unknown[] = [];
    let resolveQueue: (() => void) | null = null;

    const onMessage = (ev: unknown) => {
      queue.push(ev);
      if (resolveQueue) {
        resolveQueue();
        resolveQueue = null;
      }
    };

    ee.addListener(`chatMessage:${chatMessageId}`, onMessage);

    try {
      while (true) {
        while (queue.length > 0) {
          const event = queue.shift() as
            | {
                kind: "data";
                data: {
                  candidates?: {
                    content?: {
                      parts?: {
                        text?: string;
                      }[];
                    };
                    finishReason?: string;
                  }[];
                };
              }
            | { kind: "error"; error: unknown };

          if (event.kind === "error") {
            throw event.error;
          }

          if (event.kind === "data") {
            const candidates = event.data.candidates ?? [];
            for (const c of candidates) {
              const parts = c.content?.parts ?? [];
              for (const p of parts) {
                if (p.text) {
                  yield { text: p.text };
                }
              }
              if (c.finishReason) {
                yield { finishReason: c.finishReason };
                return;
              }
            }
          }
        }

        await new Promise<void>((resolve) => {
          resolveQueue = resolve;
        });
      }
    } finally {
      ee.removeListener(`chatMessage:${chatMessageId}`, onMessage);
    }
  }
}

async function createChatMessages(qr: Queryable, input: SendChatMessage) {
  const { chatId, text, model } = input;
  let userChatMessage;
  {
    const data: ChatMessageData = {
      role: "user",
      text,
      model,
    };
    const rs = await qr.query<
      {
        id: number;
        chatId: string;
        isAi: boolean;
        model: string;
        text: string;
        data: ChatMessageData;
        createdAt: Date;
        updatedAt: Date;
      }[]
    >(sql`
      INSERT INTO chat_messages
        (chat_id, data, is_ai, model, text)
      VALUES
        (${chatId} ::uuid, ${data as unknown} ::jsonb, false, ${model}, ${text})
      RETURNING *;
    `);
    userChatMessage = rs[0];
  }
  const data: ChatMessageData = {
    role: "model",
  };
  const rs = await qr.query<{ id: number }[]>(sql`
    INSERT INTO chat_messages
      (chat_id, data, is_ai, model, text)
    VALUES
      (${chatId} ::uuid, ${data as unknown} ::jsonb, true, ${model}, '')
    RETURNING id;
  `);
  const aiChatMessageId = rs[0].id;
  return { userChatMessage, aiChatMessageId };
}
