import type { ChatMessageFile, ChatMessageId } from "@/types/chat";
import { checkExactKeysArray } from "@/types/common";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";
import type { Db } from "./db";
import type { FileInfo } from "./mock-s3-service";

export class ChatMessageFileService {
  constructor(private readonly service: ServiceRegistry) {}

  async list(userId: UserId, input: { chatMessageId: ChatMessageId }) {
    const { chatMessageId } = input;
    const res = await this.service.db
      .selectFrom("chatMessageFiles as cmf")
      .innerJoin("chatMessages as cm", "cm.id", "cmf.chatMessageId")
      .innerJoin("chats as c", "c.id", "cm.chatId")
      .where("c.userId", "=", userId)
      .where("cmf.chatMessageId", "=", chatMessageId)
      .orderBy("cmf.id")
      .select(["cmf.fileUri", "cmf.mimeType"])
      .execute();

    return checkExactKeysArray<ChatMessageFile>()(res);
  }

  static async createAll(
    db: Db,
    input: { chatMessageId: ChatMessageId; fileInfos: FileInfo[] }
  ) {
    const { chatMessageId, fileInfos } = input;
    if (fileInfos.length === 0) return;
    const files = fileInfos.map((x) => ({
      chatMessageId,
      fileUri: x.fileUri,
      mimeType: x.mimeType,
    }));
    await db.insertInto("chatMessageFiles").values(files).execute();
  }
}
