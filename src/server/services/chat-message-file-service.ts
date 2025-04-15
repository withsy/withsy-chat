import type { ChatMessageFile, ChatMessageId } from "@/types/chat";
import type { ServiceRegistry } from "../service-registry";
import type { Db } from "./db";
import type { FileInfo } from "./mock-s3-service";

export class ChatMessageFileService {
  constructor(private readonly s: ServiceRegistry) {}

  async findAllByChatMessageId<K extends keyof ChatMessageFile>(
    chatMessageId: ChatMessageId,
    keys: K[]
  ) {
    return await this.s.db
      .selectFrom("chatMessageFiles")
      .where("chatMessageId", "=", chatMessageId)
      .orderBy("id")
      .select(keys)
      .execute();
  }

  static async creates(
    db: Db,
    input: { chatMessageId: ChatMessageId; fileInfos: FileInfo[] }
  ) {
    const { chatMessageId, fileInfos } = input;
    if (fileInfos.length === 0) return;
    await db
      .insertInto("chatMessageFiles")
      .values(
        fileInfos.map((x) => ({
          chatMessageId,
          fileUri: x.fileUri,
          mimeType: x.mimeType,
        }))
      )
      .execute();
  }
}
