import type { MessageId } from "@/types/id";
import { MessageFileSelect } from "@/types/message-file";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";
import type { FileInfo } from "./mock-s3";

export class MessageFileService {
  constructor(private readonly service: ServiceRegistry) {}

  async list(input: { userId: UserId; messageId: MessageId }) {
    const { userId, messageId } = input;
    const res = await this.service.db.messageFile.findMany({
      where: {
        message: {
          chat: {
            userId,
            deletedAt: null,
          },
        },
        messageId: messageId,
      },
      orderBy: {
        id: "asc",
      },
      select: MessageFileSelect,
    });

    return res;
  }

  static async createAll(
    tx: Tx,
    input: { messageId: MessageId; fileInfos: FileInfo[] }
  ) {
    const { messageId, fileInfos } = input;
    if (fileInfos.length === 0) return;

    const files = fileInfos.map((x) => ({
      messageId,
      fileUri: x.fileUri,
      mimeType: x.mimeType,
    }));
    await tx.messageFile.createMany({
      data: files,
    });
  }
}
