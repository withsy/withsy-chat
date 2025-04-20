import type { ChatMessageId } from "@/types/chat";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";
import type { FileInfo } from "./mock-s3-service";

export class ChatMessageFileService {
  constructor(private readonly service: ServiceRegistry) {}

  async list(userId: UserId, input: { chatMessageId: ChatMessageId }) {
    const { chatMessageId } = input;
    const res = await this.service.db.chatMessageFiles.findMany({
      where: {
        chatMessage: {
          chat: {
            userId,
            deletedAt: null,
          },
        },
        chatMessageId,
      },
      orderBy: {
        id: "asc",
      },
      select: {
        fileUri: true,
        mimeType: true,
      },
    });

    return res;
  }

  static async createAll(
    tx: Tx,
    input: { chatMessageId: ChatMessageId; fileInfos: FileInfo[] }
  ) {
    const { chatMessageId, fileInfos } = input;
    if (fileInfos.length === 0) return;
    const files = fileInfos.map((x) => ({
      chatMessageId,
      fileUri: x.fileUri,
      mimeType: x.mimeType,
    }));
    await tx.chatMessageFiles.createMany({
      data: files,
    });
  }
}
