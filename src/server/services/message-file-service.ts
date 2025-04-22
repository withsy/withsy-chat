import type { ChatMessageId } from "@/types/chat-message";
import { ChatMessageFileSelect } from "@/types/chat-message-file";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";
import type { FileInfo } from "./mock-s3-service";

export class MessageFileService {
  constructor(private readonly service: ServiceRegistry) {}

  async list(input: { userId: UserId; messageId: ChatMessageId }) {
    const { userId, messageId } = input;
    const res = await this.service.db.chatMessageFile.findMany({
      where: {
        chatMessage: {
          chat: {
            userId,
            deletedAt: null,
          },
        },
        chatMessageId: messageId,
      },
      orderBy: {
        id: "asc",
      },
      select: ChatMessageFileSelect,
    });

    return res;
  }

  static async createAll(
    tx: Tx,
    input: { messageId: ChatMessageId; fileInfos: FileInfo[] }
  ) {
    const { messageId, fileInfos } = input;
    if (fileInfos.length === 0) return;

    const files = fileInfos.map((x) => ({
      chatMessageId: messageId,
      fileUri: x.fileUri,
      mimeType: x.mimeType,
    }));
    await tx.chatMessageFile.createMany({
      data: files,
    });
  }
}
